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

    const { user_id, plan_price, wallet_enabled, coupon_code } = await req.json()
    
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
    console.log(`[validate-coupon] RECEIVED CODE: "${coupon_code}", REQ_USER: ${user_id}, AUTH_USER: ${authenticatedUser?.id}`)

    const originalPrice = parseFloat(plan_price) || 0
    let discountAmount = 0
    let subtotal = originalPrice

    let validReferralCoupon = null

    if (coupon_code) {
      const uppercaseCode = coupon_code.trim().toUpperCase()
      console.log(`[validate-coupon] NORMALIZED CODE: "${uppercaseCode}"`)
      
      // 1. Check Referral Coupons (User-Specific & First-Purchase Only)
      const { data: refCoupon, error: refErr } = await supabase
        .from('referral_coupons')
        .select('*')
        .ilike('code', uppercaseCode)
        .maybeSingle()
  
      if (refErr) {
          console.error(`[validate-coupon] DB ERROR (referral_coupons):`, refErr)
      }

      if (refCoupon) {
        console.log(`[validate-coupon] FOUND REFERRAL COUPON:`, refCoupon)

        if (refCoupon.is_used) {
            return new Response(JSON.stringify({
                success: false,
                valid: false,
                error: "This coupon has already been used."
            }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
        }

        // Step 2: Verify assigned_user_id
        if (refCoupon.user_id && (!effectiveUserId || refCoupon.user_id !== effectiveUserId)) {
            console.warn(`[validate-coupon] USER MISMATCH: coupon.user=${refCoupon.user_id}, req.user=${effectiveUserId}`)
            return new Response(JSON.stringify({
                success: false,
                valid: false,
                error: "This coupon is not assigned to your account."
            }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
        }

        // Step 3: Verify First Purchase Only
        if (effectiveUserId) {
            const { count: previousOrders } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', effectiveUserId)
                .eq('payment_status', 'paid')
            
            if (previousOrders && previousOrders > 0) {
                console.warn(`[validate-coupon] NOT FIRST PURCHASE: user ${effectiveUserId} has ${previousOrders} paid orders`)
                return new Response(JSON.stringify({
                    success: false,
                    valid: false,
                    error: "Referral coupon valid only for your first purchase."
                }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
            }
        }

        const now = new Date()
        const isExpired = refCoupon.expires_at && new Date(refCoupon.expires_at) < now
        if (!isExpired) {
          validReferralCoupon = refCoupon
          discountAmount = Math.round(originalPrice * (parseFloat(refCoupon.discount_percent) / 100))
          console.log(`[validate-coupon] VALID REFERRAL COUPON APPLIED. Discount: ${discountAmount}`)
        } else {
           console.warn(`[validate-coupon] COUPON EXPIRED: ${refCoupon.expires_at}`)
           return new Response(JSON.stringify({
                success: false,
                valid: false,
                error: "This referral coupon has expired."
            }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
        }
      } else {
          console.log(`[validate-coupon] NO REFERRAL COUPON MATCH for "${uppercaseCode}"`)
      }
  
      if (!validReferralCoupon) {
        // 2. Check Regular Coupons
        const { data: couponData, error: couponError } = await supabase
          .from('coupons')
          .select('*')
          .eq('coupon_code', uppercaseCode)
          .single()
  
        if (couponError) {
             console.log(`[validate-coupon] NO REGULAR COUPON MATCH for "${uppercaseCode}"`)
        }

        if (couponData && !couponError) {
          console.log(`[validate-coupon] FOUND REGULAR COUPON:`, couponData)
          const now = new Date()
          const isValidFrom = !couponData.valid_from || now >= new Date(couponData.valid_from)
          const isValidTo = !couponData.valid_to || now <= new Date(couponData.valid_to)
          const isLimitValid = couponData.usage_limit === null || (parseInt(couponData.used_count || 0) < parseInt(couponData.usage_limit))
  
          if (isValidFrom && isValidTo && isLimitValid) {
            if (couponData.discount_type === 'percentage') {
              discountAmount = Math.round(originalPrice * (parseFloat(couponData.discount_value) / 100))
            } else if (couponData.discount_type === 'fixed') {
              discountAmount = Math.round(parseFloat(couponData.discount_value))
            }
            console.log(`[validate-coupon] VALID REGULAR COUPON APPLIED. Discount: ${discountAmount}`)
          } else {
             let reason = "Invalid coupon code."
             if (!isValidFrom || !isValidTo) reason = "This coupon has expired."
             if (!isLimitValid) reason = "Coupon usage limit reached."
             
             return new Response(JSON.stringify({
                success: false,
                valid: false,
                error: reason
             }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
          }
        } else {
             return new Response(JSON.stringify({
                success: false,
                valid: false,
                error: "Invalid coupon code."
             }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
        }
      }
    }

    subtotal = originalPrice - discountAmount
    if (subtotal < 0) subtotal = 0

    let walletUsed = 0
    if (wallet_enabled && effectiveUserId) {
      const { data: userData } = await supabase
        .from('users')
        .select('wallet_balance')
        .eq('id', effectiveUserId)
        .single()
      
      if (userData && parseFloat(userData.wallet_balance) > 0) {
        const walletBalance = parseFloat(userData.wallet_balance)
        walletUsed = Math.min(walletBalance, subtotal)
      }
    }

    const finalAmount = Math.round(Math.max(0, subtotal - walletUsed))

    return new Response(
      JSON.stringify({
        success: true,
        valid: true,
        original_price: originalPrice,
        discount: discountAmount,
        wallet_used: walletUsed,
        subtotal: subtotal,
        final_amount: finalAmount
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, valid: false, error: err.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    )
  }
})
