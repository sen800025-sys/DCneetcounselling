export async function handlePostPaymentTasks(supabase: any, order: any, effectivePaymentId: string | null) {
    const order_id = order.id;

    console.log(`[post-payment] Starting tasks for order ${order_id}`);

    // Sync counselling_bookings
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
                console.log(`[post-payment] Wallet deducted: ${walletUsed} for user ${order.user_id}`)
            }
        }
    }

    // ── Step 4: Referral Rewards ──
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
                        console.log(`[post-payment] Referral reward given: ${cashbackAmount} to ${referrerId}`)
                    }
                }
            }
        } catch (e) { console.error("Referral Error:", e) }
    }

    // ── Step 5: Coupon Usage ──
    if (order.coupon_code) {
        try {
            const { data: refCoupon } = await supabase.from('referral_coupons').select('id, is_used').eq('code', order.coupon_code).maybeSingle()
            if (refCoupon && !refCoupon.is_used) {
                await supabase.from('referral_coupons').update({ is_used: true, used_at: new Date() }).eq('id', refCoupon.id)
            } else if (!refCoupon) {
                const { data: coupon } = await supabase.from('coupons').select('used_count').eq('coupon_code', order.coupon_code).maybeSingle()
                if (coupon) {
                    await supabase.from('coupons').update({ used_count: (coupon.used_count || 0) + 1 }).eq('coupon_code', order.coupon_code)
                }
            }
        } catch (e) { console.error("Coupon usage error:", e) }
    }
}
