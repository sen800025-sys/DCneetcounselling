import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const rzpKeyId = Deno.env.get('RAZORPAY_KEY_ID') || ''
    const rzpKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET') || ''

    const { 
      email, full_name, mobile, product_name, amount, coupon, user_id,
      category, domicile_state, neet_score, rank, counselling_type,
      wallet_enabled
    } = await req.json()

    // Step 4: Verify user via Authorization header
    const authHeader = req.headers.get("Authorization")
    let authenticatedUser = null
    if (authHeader) {
        const tempClient = createClient(supabaseUrl, supabaseKey, {
            global: { headers: { Authorization: authHeader } }
        })
        const { data: { user } } = await tempClient.auth.getUser()
        authenticatedUser = user
    }

    const effectiveUserId = authenticatedUser?.id || user_id
    console.log(`[razorpay-payment] START: email=${email}, req_user=${user_id}, auth_user=${authenticatedUser?.id}`)

    if (!amount) throw new Error("Amount is required")

    let parsedAmount = parseFloat(amount)
    let subtotal = parsedAmount
    let discount = 0
    let affiliate_ref = null
    let commission = 0
    let validCoupon = null
    let validReferralCoupon = null

    if (coupon) {
      const uppercaseCode = coupon.trim().toUpperCase()
      console.log(`[razorpay-payment] VALIDATING COUPON: "${uppercaseCode}", USER: ${effectiveUserId}`)

      const { data: refCoupon, error: refErr } = await supabase
        .from('referral_coupons')
        .select('*')
        .ilike('code', uppercaseCode)
        .maybeSingle()

      if (refCoupon) {
        if (refCoupon.is_used) throw new Error("This referral coupon has already been used.")
        if (refCoupon.user_id && (!effectiveUserId || refCoupon.user_id !== effectiveUserId)) {
            throw new Error("This referral coupon is not assigned to your account.")
        }
        if (effectiveUserId) {
            const { count: previousOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('user_id', effectiveUserId).eq('payment_status', 'paid')
            if (previousOrders && previousOrders > 0) throw new Error("Referral coupon valid only for your first purchase.")
        }

        const now = new Date()
        const isExpired = refCoupon.expires_at && new Date(refCoupon.expires_at) < now
        if (isExpired) throw new Error("This referral coupon has expired.")
        
        validReferralCoupon = refCoupon
        discount = Math.round(parsedAmount * (parseFloat(refCoupon.discount_percent) / 100))
        subtotal -= discount
      }

      if (!validReferralCoupon) {
        const { data: couponData, error: couponError } = await supabase.from('coupons').select('*').eq('coupon_code', uppercaseCode).single()
        if (couponData && !couponError) {
          const now = new Date()
          const isValidFrom = !couponData.valid_from || now >= new Date(couponData.valid_from)
          const isValidTo = !couponData.valid_to || now <= new Date(couponData.valid_to)
          const isLimitValid = couponData.usage_limit === null || (parseInt(couponData.used_count || 0) < parseInt(couponData.usage_limit))

          if (isValidFrom && isValidTo && isLimitValid) {
            validCoupon = couponData
            affiliate_ref = couponData.affiliate_ref || null
            if (couponData.discount_type === 'percentage') {
              discount = Math.round(parsedAmount * (parseFloat(couponData.discount_value) / 100))
            } else if (couponData.discount_type === 'fixed') {
              discount = Math.round(parseFloat(couponData.discount_value))
            }
            subtotal -= discount
            if (subtotal < 0) subtotal = 0
          } else {
            throw new Error("This coupon is invalid or expired.")
          }
        } else {
          throw new Error("Invalid coupon code.")
        }
      }
    }

    let walletUsed = 0
    if (wallet_enabled && effectiveUserId) {
      const { data: walletUser } = await supabase.from('users').select('wallet_balance').eq('id', effectiveUserId).single()
      if (walletUser && parseFloat(walletUser.wallet_balance) > 0) {
        const walletBalance = parseFloat(walletUser.wallet_balance)
        walletUsed = Math.min(walletBalance, subtotal)
        subtotal -= walletUsed
        if (subtotal < 0) subtotal = 0
      }
    }

    const finalAmount = Math.round(subtotal)
    const paymentMode = (walletUsed > 0 && finalAmount === 0) ? 'WALLET_ONLY' : (walletUsed > 0 ? 'WALLET_PLUS_GATEWAY' : 'GATEWAY_ONLY')

    let rzpOrderId = null
    if (finalAmount > 0) {
        const rzpOptions = {
          amount: finalAmount * 100,
          currency: "INR",
          receipt: "order_rcptid_" + Date.now()
        }
        const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Basic " + btoa(rzpKeyId + ":" + rzpKeySecret)
          },
          body: JSON.stringify(rzpOptions)
        })
        if (!rzpRes.ok) throw new Error(`Razorpay Error: ${await rzpRes.text()}`)
        const rzpOrder = await rzpRes.json()
        rzpOrderId = rzpOrder.id
    } else {
        rzpOrderId = 'WALLET_PAY_' + Date.now()
    }

    // Save to database
    const { data: newOrder, error: orderErr } = await supabase.from('orders').insert({
      user_id: effectiveUserId || null,
      user_email: email,
      email: email,
      full_name: full_name || 'Guest',
      mobile: mobile || 'N/A',
      product_name: product_name || 'Counselling Plan',
      amount: parsedAmount,
      amount_paid: finalAmount,
      discount: discount,
      wallet_used: walletUsed,
      final_amount: finalAmount,
      payment_mode: paymentMode,
      coupon_code: validReferralCoupon ? validReferralCoupon.code : (validCoupon ? validCoupon.coupon_code : null),
      affiliate_ref: affiliate_ref,
      status: finalAmount === 0 ? 'paid' : 'pending',
      payment_status: finalAmount === 0 ? 'paid' : 'pending',
      razorpay_order_id: rzpOrderId
    }).select('id').single()

    if (orderErr) throw new Error("Failed to save order: " + orderErr.message)

    // Mirror to counselling_bookings if it's not an ebook purchase
    if (counselling_type !== 'ebook') {
      try {
        await supabase.from('counselling_bookings').insert({
          user_id: effectiveUserId || null,
          full_name: full_name || 'Guest',
          email: email,
          mobile: mobile || 'N/A',
          category: category || null,
          domicile_state: domicile_state || null,
          neet_score: neet_score ? parseInt(neet_score) : null,
          rank: rank ? parseInt(rank) : null,
          plan_name: product_name || 'Counselling Plan',
          plan_price: parsedAmount,
          discounted_price: finalAmount,
          wallet_used: walletUsed,
          payment_mode: paymentMode,
          coupon_code: validReferralCoupon ? validReferralCoupon.code : (validCoupon ? validCoupon.coupon_code : null),
          payment_status: finalAmount === 0 ? 'paid' : 'pending',
          order_id: newOrder.id.toString()
        })
      } catch (e) { console.error(e) }
    }

    // If WALLET_ONLY, we need to handle the verification logic immediately
    if (finalAmount === 0) {
        console.log(`[razorpay-payment] WALLET_ONLY detected for order ${newOrder.id}. Triggering verification logic...`)
        // We will call the verify-payment function INTERNALLY or just return success and let the frontend call it
        // To keep it simple and safe, let's return a flag so the frontend knows it's WALLET_ONLY
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        order_id: newOrder.id, 
        razorpay_order_id: rzpOrderId,
        final_amount: finalAmount,
        wallet_used: walletUsed,
        payment_mode: paymentMode,
        key_id: rzpKeyId,
        is_wallet_only: finalAmount === 0
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    )
  }
})
