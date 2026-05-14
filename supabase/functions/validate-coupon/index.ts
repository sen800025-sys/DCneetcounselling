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
    const originalPrice = parseFloat(plan_price) || 0
    let discountAmount = 0
    let subtotal = originalPrice

    let validReferralCoupon = null

    if (coupon_code) {
      const uppercaseCode = coupon_code.trim().toUpperCase()
      
      const { data: refCoupon, error: refErr } = await supabase
        .from('referral_coupons')
        .select('*')
        .ilike('code', uppercaseCode)
        .eq('is_used', false)
        .maybeSingle()

      if (refCoupon && !refErr) {
        const now = new Date()
        const isExpired = refCoupon.expires_at && new Date(refCoupon.expires_at) < now
        if (!isExpired) {
          validReferralCoupon = refCoupon
          discountAmount = Math.round(originalPrice * (parseFloat(refCoupon.discount_percent) / 100))
        }
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
            if (couponData.discount_type === 'percentage') {
              discountAmount = Math.round(originalPrice * (parseFloat(couponData.discount_value) / 100))
            } else if (couponData.discount_type === 'fixed') {
              discountAmount = Math.round(parseFloat(couponData.discount_value))
            }
          } else {
             return new Response(JSON.stringify({
                success: false,
                valid: false,
                error: "Invalid coupon code."
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
    if (wallet_enabled && user_id) {
      const { data: userData } = await supabase
        .from('users')
        .select('wallet_balance')
        .eq('id', user_id)
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
