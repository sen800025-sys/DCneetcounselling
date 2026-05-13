const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMatch() {
    const codeToTest = 'WELCOME99-F7S3';
    console.log(`Testing lookup for: [${codeToTest}]`);

    const { data, error } = await supabase
        .from('referral_coupons')
        .select('*')
        .ilike('code', codeToTest)
        .eq('is_used', false)
        .maybeSingle();

    if (error) {
        console.error("Error:", error);
    } else if (data) {
        console.log("✅ Success! Found coupon:", data.id);
    } else {
        console.log("❌ Failed. Coupon not found or already used.");
    }
}

testMatch();
