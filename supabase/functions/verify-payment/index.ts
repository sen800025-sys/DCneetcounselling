import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { corsHeaders } from "../_shared/cors.ts"

// HMAC-SHA256 signature verification
async function verifySignature(secret: string, body: string, signature: string): Promise<boolean> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body))
  const hashArray = Array.from(new Uint8Array(sig))
  const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return expectedSignature === signature
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const rzpKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET') || 'PpUmeviKEcgIyhxojwbCzYI6'

    const { order_id, razorpay_payment_id, razorpay_order_id, razorpay_signature, is_wallet_only } = await req.json()
    
    // Auth Check
    const authHeader = req.headers.get("Authorization")
    let authenticatedUser = null
    if (authHeader) {
        const tempClient = createClient(supabaseUrl, supabaseKey, { global: { headers: { Authorization: authHeader } } })
        const { data: { user } } = await tempClient.auth.getUser()
        authenticatedUser = user
    }

    console.log(`[verify-payment] Called: order_id=${order_id}, wallet_only=${is_wallet_only}, auth_user=${authenticatedUser?.id}`)

    if (!order_id) throw new Error("order_id is required")

    // ── Step 0: Check Order Status ──
    const { data: order } = await supabase.from('orders').select('*').eq('id', order_id).single()
    if (!order) throw new Error("Order not found")

    // If already paid, return success (Idempotent)
    if (order.payment_status === 'paid' && !is_wallet_only) {
      return new Response(JSON.stringify({ success: true, message: "Payment already confirmed" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    // ── Step 1: Verify Signature (Only if not wallet only) ──
    if (!is_wallet_only && razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const body = razorpay_order_id + "|" + razorpay_payment_id
      const signatureValid = await verifySignature(rzpKeySecret, body, razorpay_signature)
      if (!signatureValid) console.warn(`[verify-payment] Signature verification FAILED for order ${order_id}`)
    }

    // ── Step 2: Mark Order as PAID ──
    const effectivePaymentId = razorpay_payment_id || (is_wallet_only ? order.razorpay_order_id : null)
    
    const { error: updateErr } = await supabase.from('orders').update({
        status: 'paid',
        payment_status: 'paid',
        razorpay_payment_id: effectivePaymentId
    }).eq('id', order_id)

    if (updateErr) throw new Error("Update failed: " + updateErr.message)

    await supabase.from('counselling_bookings').update({
        payment_status: 'paid',
        razorpay_payment_id: effectivePaymentId
    }).eq('order_id', order_id.toString())

    // ── Step 3: Wallet Deduction (Idempotent check) ──
    const walletUsed = parseFloat(order.wallet_used) || 0
    if (walletUsed > 0 && order.user_id) {
        // Check if already deducted
        const { count: txCount } = await supabase.from('wallet_transactions').select('*', { count: 'exact', head: true }).eq('order_id', order_id.toString()).eq('type', 'payment')
        
        if (txCount === 0) {
            const { data: user } = await supabase.from('users').select('wallet_balance').eq('id', order.user_id).single()
            if (user) {
                const balanceBefore = parseFloat(user.wallet_balance) || 0
                const balanceAfter = Math.round(Math.max(0, balanceBefore - walletUsed) * 100) / 100
                
                await supabase.from('users').update({ wallet_balance: balanceAfter }).eq('id', order.user_id)
                
                await supabase.from('wallet_transactions').insert({
                    user_id: order.user_id,
                    amount: -walletUsed,
                    type: 'payment',
                    description: `Payment for order #${order_id}`,
                    order_id: order_id.toString(),
                    name: order.full_name,
                    email: order.email,
                    mobilenumber: order.mobile,
                    balance_before: balanceBefore,
                    balance_after: balanceAfter,
                    status: 'SUCCESS'
                })
                console.log(`[verify-payment] Wallet deducted: ${walletUsed} for user ${order.user_id}`)
            }
        }
    }

    // ── Step 4: Referral Rewards ──
    // (Existing referral reward logic remains the same, just ensured it uses order.user_id)
    const effectiveUserId = order.user_id
    if (effectiveUserId) {
        try {
            const { data: profile } = await supabase.from('users').select('referred_by').eq('id', effectiveUserId).single()
            if (profile?.referred_by) {
                const referrerId = profile.referred_by
                const { data: referral } = await supabase.from('referrals').select('*').eq('referrer_id', referrerId).eq('referred_user_id', effectiveUserId).maybeSingle()
                
                if (referral && !referral.cashback_given) {
                    const cashbackAmount = Math.round(parseFloat(order.amount) * 0.10 * 100) / 100
                    const { data: referrer } = await supabase.from('users').select('wallet_balance, full_name, email, phone').eq('id', referrerId).single()
                    
                    if (referrer) {
                        const balBefore = parseFloat(referrer.wallet_balance) || 0
                        const balAfter = balBefore + cashbackAmount
                        
                        await supabase.from('users').update({ wallet_balance: balAfter }).eq('id', referrerId)
                        await supabase.from('wallet_transactions').insert({
                            user_id: referrerId,
                            amount: cashbackAmount,
                            type: 'cashback',
                            description: `Referral reward for ${order.full_name}'s purchase`,
                            order_id: order_id.toString(),
                            name: referrer.full_name,
                            email: referrer.email,
                            mobilenumber: referrer.phone,
                            balance_before: balBefore,
                            balance_after: balAfter,
                            status: 'SUCCESS'
                        })
                        await supabase.from('referrals').update({ cashback_given: true, cashback_amount: cashbackAmount, status: 'purchased' }).eq('id', referral.id)
                    }
                }
            }
        } catch (e) { console.error("Referral Error:", e) }
    }

    // ── Step 5: Coupon Usage ──
    if (order.coupon_code) {
        try {
            const { data: refCoupon } = await supabase.from('referral_coupons').select('id').eq('code', order.coupon_code).maybeSingle()
            if (refCoupon) {
                await supabase.from('referral_coupons').update({ is_used: true, used_at: new Date() }).eq('id', refCoupon.id)
            } else {
                const { data: coupon } = await supabase.from('coupons').select('used_count').eq('coupon_code', order.coupon_code).maybeSingle()
                if (coupon) {
                    await supabase.from('coupons').update({ used_count: (coupon.used_count || 0) + 1 }).eq('coupon_code', order.coupon_code)
                }
            }
        } catch (e) { console.error("Coupon usage error:", e) }
    }

    return new Response(JSON.stringify({ success: true, message: "Confirmed" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 })
  }
})
