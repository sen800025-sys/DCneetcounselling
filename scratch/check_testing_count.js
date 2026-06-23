const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.SUPABASE_URL || 'https://rlqmdylbzapyepuwncwt.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function checkReferrals() {
  const { data: referrals, error } = await supabase
    .from('referrals')
    .select('id, referrer_id, referred_user_id, status, cashback_given, cashback_amount, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching referrals:", error);
    return;
  }

  console.log("Latest Referrals:");
  console.table(referrals);

  const { data: orders, error: oError } = await supabase
    .from('orders')
    .select('id, user_id, amount, amount_paid, payment_status, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (oError) {
    console.error("Error fetching orders:", oError);
    return;
  }

  console.log("Latest Orders:");
  console.table(orders);
}

checkReferrals();
