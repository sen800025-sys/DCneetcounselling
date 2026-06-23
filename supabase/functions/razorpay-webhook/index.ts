import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { handlePostPaymentTasks } from "../_shared/post_payment.ts"

// HMAC-SHA256 verification for Razorpay webhook signature
async function verifyWebhookSignature(secret: string, body: string, signature: string): Promise<boolean> {
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
  // Webhooks are POST only, no CORS needed (server-to-server)
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') || Deno.env.get('RAZORPAY_KEY_SECRET') || 'PpUmeviKEcgIyhxojwbCzYI6'

    const rawBody = await req.text()
    const signature = req.headers.get('x-razorpay-signature') || ''

    console.log('[Webhook] Received event')

    // Verify signature
    if (signature && webhookSecret) {
      const isValid = await verifyWebhookSignature(webhookSecret, rawBody, signature)
      if (!isValid) {
        console.error('[Webhook] Signature verification FAILED')
        return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400 })
      }
      console.log('[Webhook] Signature verified ✅')
    }

    const payload = JSON.parse(rawBody)
    const event = payload.event

    console.log('[Webhook] Event type:', event)

    // Only handle payment.captured events
    if (event === 'payment.captured') {
      const payment = payload.payload?.payment?.entity
      if (!payment) {
        console.error('[Webhook] No payment entity in payload')
        return new Response(JSON.stringify({ status: 'no_payment_entity' }), { status: 200 })
      }

      const razorpay_payment_id = payment.id
      const razorpay_order_id = payment.order_id
      const amount = payment.amount / 100 // Convert paise to rupees

      console.log('[Webhook] Payment captured:', razorpay_payment_id, 'Order:', razorpay_order_id, 'Amount:', amount)

      // Find the order by razorpay_order_id
      const { data: order, error: findErr } = await supabase
        .from('orders')
        .select('*')
        .eq('razorpay_order_id', razorpay_order_id)
        .maybeSingle()

      if (findErr || !order) {
        console.error('[Webhook] Order not found for razorpay_order_id:', razorpay_order_id)
        return new Response(JSON.stringify({ status: 'order_not_found' }), { status: 200 })
      }

      // Idempotent — skip if already paid
      if (order.payment_status === 'paid') {
        console.log('[Webhook] Order already paid, skipping:', order.id)
        return new Response(JSON.stringify({ status: 'already_paid' }), { status: 200 })
      }

      // Update the order
      const { error: updateErr } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'paid',
          razorpay_payment_id: razorpay_payment_id
        })
        .eq('id', order.id)

      if (updateErr) {
        console.error('[Webhook] Update failed:', updateErr)
        return new Response(JSON.stringify({ error: 'update_failed' }), { status: 500 })
      }

      // Run post payment tasks (Referrals, Coupons, Wallet, etc.)
      await handlePostPaymentTasks(supabase, order, razorpay_payment_id)

      console.log('[Webhook] ✅ Order updated to paid and tasks ran:', order.id)
      return new Response(JSON.stringify({ status: 'ok', order_id: order.id }), { status: 200 })
    }

    // For other events, just acknowledge
    console.log('[Webhook] Ignoring event:', event)
    return new Response(JSON.stringify({ status: 'ignored' }), { status: 200 })

  } catch (err) {
    console.error('[Webhook] Error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
