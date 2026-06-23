import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { corsHeaders } from "../_shared/cors.ts"

import { handlePostPaymentTasks } from "../_shared/post_payment.ts"

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

    let isAlreadyPaid = (order.payment_status === 'paid' && !is_wallet_only)

    // ── Step 1: Verify Signature (Only if not wallet only) ──
    if (!isAlreadyPaid && !is_wallet_only && razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const body = razorpay_order_id + "|" + razorpay_payment_id
      const signatureValid = await verifySignature(rzpKeySecret, body, razorpay_signature)
      if (!signatureValid) console.warn(`[verify-payment] Signature verification FAILED for order ${order_id}`)
    }

    const effectivePaymentId = razorpay_payment_id || (is_wallet_only ? order.razorpay_order_id : null)

    if (!isAlreadyPaid) {
      // ── Step 2: Mark Order as PAID ──
      const { error: updateErr } = await supabase.from('orders').update({
          status: 'paid',
          payment_status: 'paid',
          razorpay_payment_id: effectivePaymentId
      }).eq('id', order_id)

      if (updateErr) throw new Error("Update failed: " + updateErr.message)
    }

    // Run Post Payment Tasks (Idempotent)
    await handlePostPaymentTasks(supabase, order, effectivePaymentId)

    return new Response(JSON.stringify({ success: true, message: isAlreadyPaid ? "Payment already confirmed" : "Confirmed" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 })
  }
})
