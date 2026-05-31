const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = 'https://rlqmdylbzapyepuwncwt.supabase.co';
const key = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function checkPremiumUsers() {
  console.log('Querying preference_maker_users for premium status...');
  const { data: users, error } = await supabase
    .from('preference_maker_users')
    .select('*');
    
  if (error) {
    console.error('Error fetching users:', error.message);
    return;
  }
  
  console.log(`Found ${users.length} users in preference_maker_users:`);
  for (const u of users) {
    console.log(`- Mobile: ${u.mobile} | Name: ${u.name} | Plan: ${u.plan_type} | Payment: ${u.payment_status} | Attempts: ${u.attempts_used}/${u.max_attempts} | Lists: ${u.lists_remaining}`);
  }
}

checkPremiumUsers();
