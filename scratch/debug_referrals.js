require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://rlqmdylbzapyepuwncwt.supabase.co', process.env.VITE_SUPABASE_ANON_KEY);

async function debug() {
  // List all users with referral data
  const { data: users, error: userErr } = await supabase.from('users').select('id, email, full_name, name, referral_token, wallet_balance, referred_by');
  console.log("=== ALL USERS ===");
  if (users) users.forEach(u => console.log(`  ${u.email} | token: ${u.referral_token} | wallet: ${u.wallet_balance} | referred_by: ${u.referred_by}`));
  
  // All referrals
  const { data: referrals, error: refErr } = await supabase.from('referrals').select('*');
  console.log("\n=== ALL REFERRALS ===");
  if (referrals) referrals.forEach(r => console.log(`  referrer: ${r.referrer_id} -> referred: ${r.referred_user_id} | status: ${r.status} | cashback_given: ${r.cashback_given} | cashback_amount: ${r.cashback_amount}`));
  
  // All wallet transactions
  const { data: txns } = await supabase.from('wallet_transactions').select('*');
  console.log("\n=== WALLET TRANSACTIONS ===");
  if (txns) txns.forEach(t => console.log(`  user: ${t.user_id} | amount: ${t.amount} | type: ${t.type} | desc: ${t.description}`));
  
  // All orders  
  const { data: orders } = await supabase.from('orders').select('id, user_id, email, status, payment_status, amount, final_amount, coupon_code').order('created_at', { ascending: false }).limit(10);
  console.log("\n=== RECENT ORDERS ===");
  if (orders) orders.forEach(o => console.log(`  ${o.id} | ${o.email} | status: ${o.status}/${o.payment_status} | amt: ${o.amount} -> ${o.final_amount} | coupon: ${o.coupon_code}`));
}
debug();
