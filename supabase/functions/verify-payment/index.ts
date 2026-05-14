import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { corsHeaders } from "../_shared/cors.ts"

// HMAC-SHA256 signature verification using Web Crypto API (Deno-compatible)
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

    const { order_id, razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json()
    if (!order_id) throw new Error("order_id is required")

    // Verify signature if provided
    if (razorpay_order_id && razorpay_payment_id && razorpay_signature && rzpKeySecret) {
      const body = razorpay_order_id + "|" + razorpay_payment_id
      const isValid = await verifySignature(rzpKeySecret, body, razorpay_signature)
      if (!isValid) {
        throw new Error("Payment signature verification failed")
      }
    }

    // 1. Mark order as paid
    const { data: updatedOrder, error } = await supabase.from('orders').update({
        status: 'paid',
        payment_status: 'paid',
        razorpay_payment_id: razorpay_payment_id || null
    }).eq('id', order_id).select('*').single()

    if (error || !updatedOrder) throw new Error("Order not found or update failed")

    // 2. Update counselling_bookings
    try {
        await supabase.from('counselling_bookings').update({
            payment_status: 'paid',
            razorpay_payment_id: razorpay_payment_id || null
        }).eq('order_id', order_id.toString())
    } catch (e) {
        console.error("Secondary update failed", e)
    }

    // Wallet deduction
    const orderAmount = parseFloat(updatedOrder.amount) || 0
    const orderDiscount = parseFloat(updatedOrder.discount) || 0
    const orderFinal = parseFloat(updatedOrder.final_amount) || 0
    const walletUsedAmount = Math.max(0, orderAmount - orderDiscount - orderFinal)
    
    if (walletUsedAmount > 0 && updatedOrder.user_id) {
        const { data: currentUser } = await supabase.from('users').select('wallet_balance').eq('id', updatedOrder.user_id).single()
        if (currentUser) {
            const currentBal = parseFloat(currentUser.wallet_balance) || 0
            const newBal = Math.round(Math.max(0, currentBal - walletUsedAmount) * 100) / 100
            await supabase.from('users').update({ wallet_balance: newBal }).eq('id', updatedOrder.user_id)
            
            await supabase.from('wallet_transactions').insert({
                user_id: updatedOrder.user_id,
                amount: -walletUsedAmount,
                type: 'payment',
                description: `Wallet used for order ${order_id}`,
                order_id: order_id.toString(),
                name: updatedOrder.full_name,
                email: updatedOrder.email,
                mobilenumber: updatedOrder.mobile
            })
        }
    }

    // 3. Referral Reward Logic
    let effectiveUserId = updatedOrder.user_id
    if (!effectiveUserId && (updatedOrder.email || updatedOrder.user_email)) {
        const lookupEmail = updatedOrder.email || updatedOrder.user_email
        const { data: userByEmail } = await supabase.from('users').select('id').eq('email', lookupEmail).maybeSingle()
        if (userByEmail) {
            effectiveUserId = userByEmail.id
            await supabase.from('orders').update({ user_id: effectiveUserId }).eq('id', order_id)
        }
    }

    if (effectiveUserId) {
        try {
            const { data: userProfile } = await supabase.from('users').select('referred_by').eq('id', effectiveUserId).single()
            let referrerId = userProfile?.referred_by || null

            if (!referrerId && updatedOrder.coupon_code) {
                const { data: usedCoupon } = await supabase.from('referral_coupons').select('user_id, referral_id').eq('code', updatedOrder.coupon_code).maybeSingle()
                if (usedCoupon && usedCoupon.referral_id) {
                    const { data: refRecord } = await supabase.from('referrals').select('referrer_id').eq('id', usedCoupon.referral_id).maybeSingle()
                    if (refRecord) referrerId = refRecord.referrer_id
                }
            }

            if (referrerId) {
                const { data: referralRecord } = await supabase.from('referrals')
                    .select('id, cashback_given')
                    .eq('referrer_id', referrerId)
                    .eq('referred_user_id', effectiveUserId)
                    .maybeSingle()

                let referralRecordId = referralRecord?.id || null
                let alreadyGiven = referralRecord?.cashback_given || false

                if (!referralRecord) {
                    const { data: referrerUser } = await supabase.from('users').select('full_name, name, email').eq('id', referrerId).single()
                    const { data: referredUser } = await supabase.from('users').select('full_name, name, email').eq('id', effectiveUserId).single()

                    const { data: newRef } = await supabase.from('referrals').insert({
                        referrer_id: referrerId,
                        referred_user_id: effectiveUserId,
                        referrer_name: referrerUser?.full_name || referrerUser?.name || 'Unknown',
                        referrer_email: referrerUser?.email || 'N/A',
                        referred_user_name: referredUser?.full_name || referredUser?.name || updatedOrder.full_name || 'New User',
                        referred_user_email: referredUser?.email || updatedOrder.email || 'N/A',
                        status: 'joined'
                    }).select('id').single()
                    if (newRef) referralRecordId = newRef.id
                }

                if (!alreadyGiven && referralRecordId) {
                    const cashbackAmount = parseFloat(updatedOrder.amount) * 0.10
                    const { data: referrerUser } = await supabase.from('users').select('wallet_balance, full_name, email, phone').eq('id', referrerId).single()

                    if (referrerUser) {
                        const currentBalance = parseFloat(referrerUser.wallet_balance) || 0
                        const newBalance = currentBalance + cashbackAmount

                        await supabase.from('users').update({ wallet_balance: newBalance }).eq('id', referrerId)
                        
                        await supabase.from('wallet_transactions').insert({
                            user_id: referrerId,
                            amount: cashbackAmount,
                            type: 'cashback',
                            description: `Referral cashback for order ${order_id}`,
                            order_id: order_id.toString(),
                            name: referrerUser.full_name,
                            email: referrerUser.email,
                            mobilenumber: referrerUser.phone
                        })

                        await supabase.from('referrals').update({
                            cashback_given: true,
                            cashback_amount: cashbackAmount,
                            status: 'purchased'
                        }).eq('id', referralRecordId)
                    }
                }
            }
        } catch (e) {
            console.error("Cashback error", e)
        }
    }

    // 5. Increment coupon usage
    if (updatedOrder && updatedOrder.coupon_code) {
        const { data: refCoupon } = await supabase.from('referral_coupons').select('*').eq('code', updatedOrder.coupon_code).maybeSingle()
        if (refCoupon) {
            await supabase.from('referral_coupons').update({ is_used: true, used_at: new Date() }).eq('id', refCoupon.id)
        } else {
            const { data: coupon } = await supabase.from('coupons').select('*').eq('coupon_code', updatedOrder.coupon_code).single()
            if (coupon) {
                await supabase.from('coupons').update({ used_count: coupon.used_count + 1 }).eq('coupon_code', updatedOrder.coupon_code)
                await supabase.from('coupon_usage').insert([{
                    coupon_code: coupon.coupon_code,
                    order_id: updatedOrder.id.toString(),
                    user_email: updatedOrder.email || updatedOrder.user_email,
                    user_mobile: updatedOrder.mobile,
                    plan_name: updatedOrder.product_name || 'Counselling Plan',
                    original_price: updatedOrder.amount,
                    discounted_price: updatedOrder.final_amount,
                    discount_applied: updatedOrder.discount || 0,
                    payment_status: 'success'
                }])
            }
        }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Payment confirmed successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    )
  }
})
