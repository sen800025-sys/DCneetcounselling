const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugCoupons() {
    console.log("--- Supabase Diagnostic ---");
    console.log("URL:", supabaseUrl);
    
    // 1. Test Connection / Users
    const { data: users, error: userErr } = await supabase.from('users').select('id').limit(1);
    if (userErr) {
        console.error("❌ Connection failed or 'users' table missing:", userErr.message);
    } else {
        console.log("✅ Connected to Supabase");
    }

    // 2. Check referral_coupons table
    console.log("\n--- Checking referral_coupons Table ---");
    const { data: coupons, error: couponErr } = await supabase.from('referral_coupons').select('*');
    
    if (couponErr) {
        console.error("❌ Error fetching referral_coupons:", couponErr.message);
        if (couponErr.message.includes("does not exist")) {
            console.log("💡 TIP: You need to run the SQL migration to create this table.");
        }
    } else {
        console.log(`✅ Table exists. Found ${coupons.length} coupons.`);
        if (coupons.length > 0) {
            console.log("Sample Coupon:", coupons[0]);
        }
    }

    // 3. Check referrals table
    console.log("\n--- Checking referrals Table ---");
    const { data: refs, error: refErr } = await supabase.from('referrals').select('*').limit(5);
    if (refErr) {
        console.error("❌ Error fetching referrals:", refErr.message);
    } else {
        console.log(`✅ Table exists. Found ${refs.length} recent referrals.`);
    }
}

debugCoupons();
