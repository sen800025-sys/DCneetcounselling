const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://rlqmdylbzapyepuwncwt.supabase.co';
const fs = require('fs');
const html = fs.readFileSync('frontend/web/index.html', 'utf8');
const anonKeyMatch = html.match(/const anonKey = ["']([^"']+)["']/);
const anonKey = anonKeyMatch ? anonKeyMatch[1] : '';

const supabase = createClient(supabaseUrl, anonKey);

async function test() {
    const recordData = {
          full_name: "Test User",
          category: "General",
          domicile_state: "MH",
          neet_score: 500,
          rank: 10000,
          email: "test@example.com",
          mobile: "9999999999",
          course: "Medical",
          quota: "All India Quota",
          amount_paid: 99,
          ebook_id: "medical_all_india_quota",
          payment_status: 'initiated',
          created_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('ebook_users').insert([recordData]);
    if (error) {
        console.log("INSERT ERROR:", error);
    } else {
        console.log("INSERT SUCCESS");
    }
}
test();
