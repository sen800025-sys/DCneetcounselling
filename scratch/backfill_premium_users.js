const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = 'https://rlqmdylbzapyepuwncwt.supabase.co';
const key = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function backfill() {
  console.log('Fetching all users in preference_maker_users...');
  const { data: users, error: userErr } = await supabase
    .from('preference_maker_users')
    .select('*');
    
  if (userErr) {
    console.error('Error fetching users:', userErr.message);
    return;
  }
  
  console.log(`Checking ${users.length} users for paid orders...`);
  
  for (const u of users) {
    const { data: orders, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('mobile', u.mobile)
      .eq('payment_status', 'paid')
      .not('product_name', 'ilike', '%ebook%');
      
    if (orderErr) {
      console.error(`Error fetching orders for mobile ${u.mobile}:`, orderErr.message);
      continue;
    }
    
    if (orders && orders.length > 0) {
      console.log(`User ${u.name} (Mobile: ${u.mobile}) has ${orders.length} paid counselling orders. Upgrading to Premium...`);
      const { data: updated, error: updErr } = await supabase
        .from('preference_maker_users')
        .update({
          plan_type: 'premium',
          payment_status: 'paid',
          lists_remaining: 3
        })
        .eq('id', u.id)
        .select();
        
      if (updErr) {
        console.error(`Failed to update ${u.name}:`, updErr.message);
      } else {
        console.log(`✅ Success! Upgraded ${u.name} (Mobile: ${u.mobile}) to Premium.`);
      }
    } else {
      console.log(`User ${u.name} (Mobile: ${u.mobile}) has no paid counselling orders.`);
    }
  }
}

backfill();
