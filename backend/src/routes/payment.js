const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') }); // Load from root

const router = express.Router();

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('[PaymentAPI] Initializing Supabase with URL:', supabaseUrl);
if (!supabaseKey) console.error('[PaymentAPI] CRITICAL: No Supabase Key found in environment!');

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_ShlgHvLVwqmST2',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '2MzRW1BAyaURYGWXiAmPhQqa'
});

// Get Payment Summary API (calculates all discounts and final price server-side)
router.post('/payment-summary', async (req, res) => {
    try {
        const { user_id, plan_price, wallet_enabled, coupon_code } = req.body;
        console.log(`[Summary] Request: user_id=${user_id}, price=${plan_price}, coupon=${coupon_code}`);
        const originalPrice = parseFloat(plan_price) || 0;
        
        let discountAmount = 0;
        let subtotal = originalPrice;

        // Check for Referral Coupon First
        let validReferralCoupon = null;
        if (coupon_code) {
            const uppercaseCode = coupon_code.trim().toUpperCase();
            
            const { data: refCoupon, error: refErr } = await supabase
                .from('referral_coupons')
                .select('*')
                .ilike('code', uppercaseCode)
                .eq('is_used', false)
                .maybeSingle();
            
            console.log(`[SummaryCheck] Searching for: ${uppercaseCode}`);
            if (refErr) console.error('[SummaryCheck] Supabase Error:', refErr);
            console.log(`[SummaryCheck] Data Found:`, refCoupon);
            
            if (refCoupon && !refErr) {
                const now = new Date();
                const isExpired = refCoupon.expires_at && new Date(refCoupon.expires_at) < now;
                
                if (!isExpired) {
                    validReferralCoupon = refCoupon;
                    discountAmount = Math.round(originalPrice * (parseFloat(refCoupon.discount_percent) / 100));
                }
            }

            // If not a referral coupon, check regular coupons
            if (!validReferralCoupon) {
                const { data: couponData, error: couponError } = await supabase
                    .from('coupons')
                    .select('*')
                    .eq('coupon_code', uppercaseCode)
                    .single();

                if (couponData && !couponError) {
                    const now = new Date();
                    const isValidFrom = !couponData.valid_from || now >= new Date(couponData.valid_from);
                    const isValidTo = !couponData.valid_to || now <= new Date(couponData.valid_to);
                    const isLimitValid = couponData.usage_limit === null || couponData.used_count < couponData.usage_limit;

                    if (isValidFrom && isValidTo && isLimitValid) {
                        if (couponData.discount_type === 'percentage') {
                            discountAmount = Math.round(originalPrice * (parseFloat(couponData.discount_value) / 100));
                        } else if (couponData.discount_type === 'fixed') {
                            discountAmount = Math.round(parseFloat(couponData.discount_value));
                        }
                    }
                }
            }
        }

        subtotal = originalPrice - discountAmount;
        if (subtotal < 0) subtotal = 0;
        
        console.log(`[Summary] Subtotal: ${subtotal}, Discount: ${discountAmount}`);

        // Apply wallet balance if enabled
        let walletUsed = 0;
        if (wallet_enabled && user_id) {
            const { data: userData } = await supabase
                .from('users')
                .select('wallet_balance')
                .eq('id', user_id)
                .single();
            
            if (userData && parseFloat(userData.wallet_balance) > 0) {
                const walletBalance = parseFloat(userData.wallet_balance);
                walletUsed = Math.min(walletBalance, subtotal);
                console.log(`[Summary] Wallet: balance=₹${walletBalance}, using=₹${walletUsed}`);
            }
        }

        const finalAmount = Math.round(Math.max(0, subtotal - walletUsed));
        console.log(`[Summary] Result -> Final: ₹${finalAmount}, WalletUsed: ₹${walletUsed}`);

        res.json({
            success: true,
            original_price: originalPrice,
            discount: discountAmount,
            wallet_used: walletUsed,
            subtotal: subtotal,
            final_amount: finalAmount
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Create Order API
router.post('/create-order', async (req, res) => {
    try {
        const { 
            email, full_name, mobile, product_name, amount, coupon, user_id,
            category, domicile_state, neet_score, rank, counselling_type,
            wallet_enabled
        } = req.body;

        if (!amount) return res.status(400).json({ success: false, error: "Amount is required" });
        console.log(`[CreateOrder] user_id=${user_id}, email=${email}, amount=${amount}, coupon=${coupon}`);

        let parsedAmount = parseFloat(amount);
        let subtotal = parsedAmount;
        let discount = 0;
        
        let affiliate_ref = null;
        let commission = 0;
        let validCoupon = null;
        let validReferralCoupon = null;

        // 1. Check for Referral Coupon First
        if (coupon) {
            const uppercaseCode = coupon.trim().toUpperCase();
            
            const { data: refCoupon, error: refErr } = await supabase
                .from('referral_coupons')
                .select('*')
                .ilike('code', uppercaseCode)
                .eq('is_used', false)
                .maybeSingle();
            
            console.log(`[ReferralCheck] Searching for: ${uppercaseCode}`);
            if (refErr) console.error('[ReferralCheck] Supabase Error:', refErr);
            console.log(`[ReferralCheck] Data Found:`, refCoupon);
            
            if (refCoupon && !refErr) {
                const now = new Date();
                const isExpired = refCoupon.expires_at && new Date(refCoupon.expires_at) < now;
                
                if (isExpired) {
                    return res.status(400).json({ success: false, error: "This referral coupon has expired." });
                }

                validReferralCoupon = refCoupon;
                discount = Math.round(parsedAmount * (parseFloat(refCoupon.discount_percent) / 100));
                subtotal -= discount;
            }

            // 2. If not a referral coupon, apply Regular Coupon
            if (!validReferralCoupon) {
                const { data: couponData, error: couponError } = await supabase
                    .from('coupons')
                    .select('*')
                    .eq('coupon_code', uppercaseCode)
                    .single();

                if (couponData && !couponError) {
                    const now = new Date();
                    const validFromDate = couponData.valid_from ? new Date(couponData.valid_from) : null;
                    const validToDate = couponData.valid_to ? new Date(couponData.valid_to) : null;
                    
                    const isValidFrom = !validFromDate || now >= validFromDate;
                    const isValidTo = !validToDate || now <= validToDate;
                    const isLimitValid = couponData.usage_limit === null || (parseInt(couponData.used_count || 0) < parseInt(couponData.usage_limit));

                    console.log(`[CouponCheck] Code: ${uppercaseCode}, ValidFrom: ${isValidFrom}, ValidTo: ${isValidTo}, Limit: ${isLimitValid}`);

                    if (isValidFrom && isValidTo && isLimitValid) {
                        validCoupon = couponData;
                        affiliate_ref = couponData.affiliate_ref || null;

                        if (couponData.discount_type === 'percentage') {
                            discount = Math.round(parsedAmount * (parseFloat(couponData.discount_value) / 100));
                        } else if (couponData.discount_type === 'fixed') {
                            discount = Math.round(parseFloat(couponData.discount_value));
                        }
                        
                        subtotal -= discount;
                        if (subtotal < 0) subtotal = 0;

                        if (affiliate_ref) {
                            const { data: aff } = await supabase.from('affiliates').select('*').eq('ref_code', affiliate_ref).single();
                            if (aff) {
                                if (aff.commission_type === 'percentage') {
                                    commission = Math.round(subtotal * (parseFloat(aff.commission_value) / 100));
                                } else {
                                    commission = parseFloat(aff.commission_value);
                                }
                            }
                        }
                    } else {
                        let errorMsg = "This coupon is invalid.";
                        if (!isValidFrom) errorMsg = `This coupon will be active starting ${validFromDate.toLocaleDateString()}.`;
                        else if (!isValidTo) errorMsg = "This coupon has expired.";
                        else if (!isLimitValid) errorMsg = "This coupon has reached its usage limit.";
                        
                        return res.status(400).json({ success: false, error: errorMsg });
                    }
                } else {
                    return res.status(400).json({ success: false, error: "Invalid coupon code" });
                }
            }
        }

        // Apply wallet balance if enabled
        let walletUsed = 0;
        if (wallet_enabled && user_id) {
            const { data: walletUser } = await supabase
                .from('users')
                .select('wallet_balance')
                .eq('id', user_id)
                .single();
            
            if (walletUser && parseFloat(walletUser.wallet_balance) > 0) {
                const walletBalance = parseFloat(walletUser.wallet_balance);
                walletUsed = Math.min(walletBalance, subtotal);
                subtotal -= walletUsed;
                if (subtotal < 0) subtotal = 0;
                console.log(`[CreateOrder] Wallet applied: ₹${walletUsed}, remaining to pay: ₹${subtotal}`);
            }
        }

        const finalAmount = subtotal;

        const options = {
            amount: Math.round(finalAmount * 100),
            currency: "INR",
            receipt: "order_rcptid_" + Date.now()
        };

        const rzpOrder = await razorpay.orders.create(options);

        // 3. Insert into main orders table
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
        }).select('id').single();

        if (orderErr) {
            console.error("Order Insert Error:", orderErr);
            return res.status(500).json({ success: false, error: "Failed to save order" });
        }

        // 4. Record the booking details in counselling_bookings table
        // We always try to insert here for all orders created through this route to ensure no data loss
        try {
            const { error: bookingErr } = await supabase.from('counselling_bookings').insert({
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
            });

            if (bookingErr) {
                console.error("[CreateOrder] Counselling Booking Insert Error:", bookingErr);
                // We don't return error to user here as the main order was already created
            } else {
                console.log("[CreateOrder] Booking recorded in counselling_bookings");
            }
        } catch (bookingCatch) {
            console.error("[CreateOrder] Critical error saving to counselling_bookings:", bookingCatch);
        }

        // 5. Update user profile with the provided mobile number if user is logged in
        if (user_id && mobile && mobile !== 'N/A') {
            await supabase.from('users').update({ mobile_number: mobile, phone: mobile }).eq('id', user_id);
        }

        res.json({ 
            success: true, 
            order_id: newOrder.id, 
            razorpay_order_id: rzpOrder.id,
            final_amount: finalAmount,
            wallet_used: walletUsed
        });
    } catch (error) {
        console.error("Order Creation Error:", error);
        res.status(500).json({ success: false, error: "Razorpay order creation failed", details: error.message || error });
    }
});

// Create standalone Razorpay Order API (as requested)
router.post('/create-razorpay-order', async (req, res) => {
    try {
        const { amount } = req.body;
        console.log("Amount sent:", amount);

        if (!amount) {
            return res.status(400).json({ success: false, message: "Amount required" });
        }

        const options = {
            amount: Math.round(amount * 100), // convert to paisa
            currency: "INR",
            receipt: "order_" + Date.now()
        };

        console.log("Creating order with:", options);
        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            order
        });

    } catch (err) {
        console.error("RAZORPAY ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Order creation failed"
        });
    }
});

// Confirm Payment API
router.post('/confirm-payment', async (req, res) => {
    try {
        const { order_id, razorpay_payment_id } = req.body;
        if (!order_id) return res.status(400).json({ success: false, error: "order_id is required" });

        // 1. Mark order as paid
        const { data: updatedOrder, error } = await supabase.from('orders').update({
            status: 'paid',
            payment_status: 'paid',
            razorpay_payment_id: razorpay_payment_id || null
        }).eq('id', order_id).select('*').single();

        if (error || !updatedOrder) {
            console.error("Update Order Error:", error || "Order not found");
            return res.status(500).json({ success: false, error: "Order not found or update failed" });
        }

        // 2. Update counselling_bookings if it exists
        try {
            await supabase.from('counselling_bookings').update({
                payment_status: 'paid',
                razorpay_payment_id: razorpay_payment_id || null
            }).eq('order_id', order_id.toString());
        } catch (bookingErr) {
            console.error("Secondary update (counselling_bookings) failed:", bookingErr);
            // We continue because the primary order is already updated
        }

        // 2.5 Deduct wallet balance if wallet was used
        // wallet_used = original_amount - discount - final_amount (i.e. the gap paid by wallet)
        const orderAmount = parseFloat(updatedOrder.amount) || 0;
        const orderDiscount = parseFloat(updatedOrder.discount) || 0;
        const orderFinal = parseFloat(updatedOrder.final_amount) || 0;
        const walletUsedAmount = Math.max(0, orderAmount - orderDiscount - orderFinal);
        
        if (walletUsedAmount > 0 && updatedOrder.user_id) {
            console.log(`[ConfirmPayment] Deducting wallet: ₹${walletUsedAmount} from user ${updatedOrder.user_id}`);
            const { data: currentUser } = await supabase.from('users').select('wallet_balance').eq('id', updatedOrder.user_id).single();
            if (currentUser) {
                const currentBal = parseFloat(currentUser.wallet_balance) || 0;
                const newBal = Math.round(Math.max(0, currentBal - walletUsedAmount) * 100) / 100;
                await supabase.from('users').update({ wallet_balance: newBal }).eq('id', updatedOrder.user_id);
                
                // Log wallet deduction
                await supabase.from('wallet_transactions').insert({
                    user_id: updatedOrder.user_id,
                    amount: -walletUsedAmount,
                    type: 'payment',
                    description: `Wallet used for order ${order_id}`,
                    order_id: order_id.toString(),
                    name: updatedOrder.full_name,
                    email: updatedOrder.email,
                    mobilenumber: updatedOrder.mobile
                });
                console.log(`[ConfirmPayment] Wallet deducted: ₹${currentBal} → ₹${newBal}`);
            }
        }
 
        // Note: referral discount is effectively marked as used by the order status becoming 'paid'

        // 3. Referral Reward Logic (Credit cashback to referrer wallet)
        // Resolve user_id: use order's user_id, or fallback to looking up by email
        let effectiveUserId = updatedOrder.user_id;
        if (!effectiveUserId && (updatedOrder.email || updatedOrder.user_email)) {
            const lookupEmail = updatedOrder.email || updatedOrder.user_email;
            console.log('[Cashback] No user_id on order, looking up by email:', lookupEmail);
            const { data: userByEmail } = await supabase
                .from('users')
                .select('id')
                .eq('email', lookupEmail)
                .maybeSingle();
            if (userByEmail) {
                effectiveUserId = userByEmail.id;
                // Also update the order with the correct user_id for future reference
                await supabase.from('orders').update({ user_id: effectiveUserId }).eq('id', order_id);
                console.log('[Cashback] Resolved user_id from email:', effectiveUserId);
            }
        }

        console.log('[Cashback] Starting referral cashback check for user_id:', effectiveUserId);
        if (effectiveUserId) {
            try {
                // Step A: Find referrer via users.referred_by
                const { data: userProfile, error: userProfileErr } = await supabase
                    .from('users')
                    .select('referred_by')
                    .eq('id', effectiveUserId)
                    .single();

                console.log('[Cashback] User profile:', userProfile, 'Error:', userProfileErr);

                let referrerId = userProfile?.referred_by || null;

                // Step B: If no referred_by, try finding referrer via the referral coupon used in this order
                if (!referrerId && updatedOrder.coupon_code) {
                    console.log('[Cashback] No referred_by found, checking referral_coupons for code:', updatedOrder.coupon_code);
                    const { data: usedCoupon } = await supabase
                        .from('referral_coupons')
                        .select('user_id, referral_id')
                        .eq('code', updatedOrder.coupon_code)
                        .maybeSingle();

                    if (usedCoupon && usedCoupon.referral_id) {
                        const { data: refRecord } = await supabase
                            .from('referrals')
                            .select('referrer_id')
                            .eq('id', usedCoupon.referral_id)
                            .maybeSingle();
                        if (refRecord) {
                            referrerId = refRecord.referrer_id;
                            console.log('[Cashback] Found referrer via coupon referral_id:', referrerId);
                        }
                    }
                }

                if (referrerId) {
                    console.log('[Cashback] Referrer ID found:', referrerId);

                    // Check if cashback already given via referrals table
                    const { data: referralRecord } = await supabase
                        .from('referrals')
                        .select('id, cashback_given')
                        .eq('referrer_id', referrerId)
                        .eq('referred_user_id', effectiveUserId)
                        .maybeSingle();

                    console.log('[Cashback] Referral record:', referralRecord);

                    let referralRecordId = referralRecord?.id || null;
                    let alreadyGiven = referralRecord?.cashback_given || false;

                    // If no referral record exists, create one
                    if (!referralRecord) {
                        console.log('[Cashback] No referral record found, creating one...');
                        
                        // Fetch both users' details to populate the table properly
                        const { data: referrerUser } = await supabase.from('users').select('full_name, name, email').eq('id', referrerId).single();
                        const { data: referredUser } = await supabase.from('users').select('full_name, name, email').eq('id', effectiveUserId).single();

                        const { data: newRef, error: newRefErr } = await supabase
                            .from('referrals')
                            .insert({
                                referrer_id: referrerId,
                                referred_user_id: effectiveUserId,
                                referrer_name: referrerUser?.full_name || referrerUser?.name || 'Unknown',
                                referrer_email: referrerUser?.email || 'N/A',
                                referred_user_name: referredUser?.full_name || referredUser?.name || updatedOrder.full_name || 'New User',
                                referred_user_email: referredUser?.email || updatedOrder.email || 'N/A',
                                status: 'joined'
                            })
                            .select('id')
                            .single();
                        if (newRef) {
                            referralRecordId = newRef.id;
                            console.log('[Cashback] Created referral record:', referralRecordId);
                        } else {
                            console.error('[Cashback] Failed to create referral record:', newRefErr);
                        }
                    }

                    if (!alreadyGiven && referralRecordId) {
                        // Credit 10% cashback to referrer based on ORIGINAL price (before discount)
                        const cashbackAmount = parseFloat(updatedOrder.amount) * 0.10;
                        console.log('[Cashback] Crediting cashback:', cashbackAmount, 'to referrer:', referrerId);
                        
                        const { data: referrerUser, error: referrerErr } = await supabase.from('users').select('wallet_balance, full_name, email, phone').eq('id', referrerId).single();
                        console.log('[Cashback] Referrer wallet data:', referrerUser, 'Error:', referrerErr);

                        if (referrerUser) {
                            const currentBalance = parseFloat(referrerUser.wallet_balance) || 0;
                            const newBalance = currentBalance + cashbackAmount;

                            const { error: walletUpdateErr } = await supabase.from('users').update({ wallet_balance: newBalance }).eq('id', referrerId);
                            console.log('[Cashback] Wallet updated:', currentBalance, '->', newBalance, 'Error:', walletUpdateErr);

                            // Log wallet transaction
                            const { error: txnErr } = await supabase.from('wallet_transactions').insert({
                                user_id: referrerId,
                                amount: cashbackAmount,
                                type: 'cashback',
                                description: `Referral cashback for order ${order_id}`,
                                order_id: order_id.toString(),
                                name: referrerUser.full_name,
                                email: referrerUser.email,
                                mobilenumber: referrerUser.phone
                            });
                            console.log('[Cashback] Transaction logged, Error:', txnErr);

                            // Mark referral as processed
                            const { error: refUpdateErr } = await supabase.from('referrals').update({
                                cashback_given: true,
                                cashback_amount: cashbackAmount,
                                status: 'purchased'
                            }).eq('id', referralRecordId);
                            console.log('[Cashback] Referral marked as processed, Error:', refUpdateErr);

                            console.log('[Cashback] ✅ Successfully credited ₹' + cashbackAmount + ' to referrer ' + referrerId);
                        } else {
                            console.error('[Cashback] ❌ Could not find referrer user record');
                        }
                    } else if (alreadyGiven) {
                        console.log('[Cashback] ⏭ Cashback already given for this referral');
                    }
                } else {
                    console.log('[Cashback] No referrer found for this user');
                }
            } catch (cashbackErr) {
                // Don't fail the payment confirmation if cashback fails
                console.error('[Cashback] ❌ Error in cashback logic (payment still confirmed):', cashbackErr);
            }
        }

        // 5. Increment coupon usage
        if (updatedOrder && updatedOrder.coupon_code) {
            // Check if it's a referral coupon
            const { data: refCoupon } = await supabase.from('referral_coupons').select('*').eq('code', updatedOrder.coupon_code).maybeSingle();
            
            if (refCoupon) {
                // Mark referral coupon as used
                await supabase.from('referral_coupons').update({ 
                    is_used: true, 
                    used_at: new Date() 
                }).eq('id', refCoupon.id);
            } else {
                // Regular coupon logic
                const { data: coupon } = await supabase.from('coupons').select('*').eq('coupon_code', updatedOrder.coupon_code).single();
                if (coupon) {
                    await supabase.from('coupons').update({ used_count: coupon.used_count + 1 }).eq('coupon_code', updatedOrder.coupon_code);
                    
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
                    }]);
                }
            }
        }

        res.json({ success: true, message: "Payment confirmed successfully" });
    } catch (error) {
        console.error("Payment Confirmation Error:", error);
        res.status(500).json({ success: false, error: "Payment confirmation failed" });
    }
});

// Payment Success API (with signature verification)
router.post('/payment-success', async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            email, fullName, mobile, ctx, userId
        } = req.body;

        console.log("Payment success request body:", req.body);

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || '2MzRW1BAyaURYGWXiAmPhQqa')
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            // SUCCESS - Verify and save to database
            
            // Record Coupon Usage
            if (ctx && ctx.appliedCoupon) {
                const finalAmount = ctx.price;
                const commission = finalAmount * 0.20;
                await supabase.from('coupon_usage').insert({
                    coupon_code: ctx.appliedCoupon.coupon_code || ctx.appliedCoupon.id,
                    user_email: email,
                    original_price: ctx.originalPrice,
                    discount_applied: ctx.originalPrice - ctx.price,
                    discounted_price: finalAmount,
                    payment_status: 'success'
                });
            }

            // Clear Cart if applicable
            if (ctx && ctx.is_cart && userId) {
                await supabase.from('cart').delete().eq('user_id', userId);
            }

            // Save order to orders table securely
            if (userId && ctx) {
                await supabase.from('orders').insert({
                    user_id: userId,
                    full_name: fullName,
                    email: email,
                    mobile: mobile,
                    product_name: ctx.course + ' (' + ctx.quota + ')',
                    amount_paid: ctx.price,
                    payment_status: 'success',
                    razorpay_payment_id: razorpay_payment_id,
                    razorpay_order_id: razorpay_order_id,
                    created_at: new Date()
                });
            }

            // Update ebook_users record status
            if (ctx && email) {
                await supabase.from('ebook_users')
                    .update({
                        payment_status: 'success',
                        razorpay_payment_id: razorpay_payment_id,
                        razorpay_order_id: razorpay_order_id
                    })
                    .eq('email', email)
                    .eq('course', ctx.course)
                    .eq('payment_status', 'initiated');
            }

            return res.json({ success: true, message: "Payment verified successfully" });
        } else {
            console.error("Signature mismatch. Expected:", expectedSignature, "Got:", razorpay_signature);
            return res.status(400).json({ success: false, message: "Payment verification failed" });
        }
    } catch (error) {
        console.error("Payment Verification Error:", error);
        return res.status(500).json({ success: false, message: "Server error during verification" });
    }
});

module.exports = router;
