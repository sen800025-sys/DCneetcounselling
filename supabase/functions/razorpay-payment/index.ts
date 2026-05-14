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
      const { data: refCoupon, error: refErr } = await supabase
        .from('referral_coupons')
        .select('*')
        .ilike('code', uppercaseCode)
        .eq('is_used', false)
        .maybeSingle()

      if (refCoupon && !refErr) {
        const now = new Date()
        const isExpired = refCoupon.expires_at && new Date(refCoupon.expires_at) < now
        if (isExpired) {
          throw new Error("This referral coupon has expired.")
        }
        validReferralCoupon = refCoupon
        discount = Math.round(parsedAmount * (parseFloat(refCoupon.discount_percent) / 100))
        subtotal -= discount
      }

      if (!validReferralCoupon) {
        const { data: couponData, error: couponError } = await supabase
          .from('coupons')
          .select('*')
          .eq('coupon_code', uppercaseCode)
          .single()

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

            if (affiliate_ref) {
              const { data: aff } = await supabase.from('affiliates').select('*').eq('ref_code', affiliate_ref).single()
              if (aff) {
                if (aff.commission_type === 'percentage') {
                  commission = Math.round(subtotal * (parseFloat(aff.commission_value) / 100))
                } else {
                  commission = parseFloat(aff.commission_value)
                }
              }
            }
          } else {
            throw new Error("This coupon is invalid.")
          }
        } else {
          throw new Error("Invalid coupon code")
        }
      }
    }

    let walletUsed = 0
    if (wallet_enabled && user_id) {
      const { data: walletUser } = await supabase.from('users').select('wallet_balance').eq('id', user_id).single()
      if (walletUser && parseFloat(walletUser.wallet_balance) > 0) {
        const walletBalance = parseFloat(walletUser.wallet_balance)
        walletUsed = Math.min(walletBalance, subtotal)
        subtotal -= walletUsed
        if (subtotal < 0) subtotal = 0
      }
    }

    const finalAmount = subtotal

    // Create Razorpay order via REST API
    const rzpOptions = {
      amount: Math.round(finalAmount * 100),
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

    if (!rzpRes.ok) {
      const text = await rzpRes.text()
      throw new Error(`Razorpay Error: ${text}`)
    }

    const rzpOrder = await rzpRes.json()

    // Save to database
    const { data: newOrder, error: orderErr } = await supabase.from('orders').insert({
      user_id: user_id || null,
      user_email: email,
      email: email,
      full_name: full_name || 'Guest',
      mobile: mobile || 'N/A',
      product_name: product_name || 'Counselling Plan',
      amount: parsedAmount,
      amount_paid: finalAmount,
      discount: discount,
      final_amount: finalAmount,
      coupon_code: validReferralCoupon ? validReferralCoupon.code : (validCoupon ? validCoupon.coupon_code : null),
      affiliate_ref: affiliate_ref,
      commission: commission,
      status: 'pending',
      payment_status: 'pending',
      razorpay_order_id: rzpOrder.id
    }).select('id').single()

    if (orderErr) throw new Error("Failed to save order")

    try {
      await supabase.from('counselling_bookings').insert({
        user_id: user_id || null,
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
        counselling_type: counselling_type || null,
        coupon_code: validReferralCoupon ? validReferralCoupon.code : (validCoupon ? validCoupon.coupon_code : null),
        payment_status: 'pending',
        order_id: newOrder.id.toString()
      })
    } catch (e) {
      console.error(e)
    }

    if (user_id && mobile && mobile !== 'N/A') {
      await supabase.from('users').update({ mobile_number: mobile, phone: mobile }).eq('id', user_id)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        order_id: newOrder.id, 
        razorpay_order_id: rzpOrder.id,
        final_amount: finalAmount,
        wallet_used: walletUsed,
        order: { id: rzpOrder.id },
        key_id: rzpKeyId
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
