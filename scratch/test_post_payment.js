const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.SUPABASE_URL || 'https://rlqmdylbzapyepuwncwt.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function testPostPayment() {
    // We will just read the post_payment code and run it directly here to test it.
    const order_id = '86688176-8f75-4cba-b0e0-b3c6c4b69722';
    const { data: order } = await supabase.from('orders').select('*').eq('id', order_id).single();
    if (!order) {
        console.log("Order not found");
        return;
    }
    console.log("Order found:", order);

    const effectiveUserId = order.user_id;
    if (effectiveUserId) {
        try {
            const { data: profile } = await supabase.from('users').select('referred_by').eq('id', effectiveUserId).single();
            console.log("Profile:", profile);
            if (profile?.referred_by) {
                const referrerId = profile.referred_by;
                const { data: referral } = await supabase.from('referrals').select('*').eq('referrer_id', referrerId).eq('referred_user_id', effectiveUserId).maybeSingle();
                console.log("Referral:", referral);
                
                if (referral && !referral.cashback_given) {
                    const cashbackAmount = Math.round(parseFloat(order.amount) * 0.10 * 100) / 100;
                    console.log("Cashback to give:", cashbackAmount);
                    // Just simulation, not actually giving it to avoid double
                } else {
                    console.log("Referral already given or not found");
                }
            }
        } catch (e) { console.error("Referral Error:", e); }
    }
}
testPostPayment();
