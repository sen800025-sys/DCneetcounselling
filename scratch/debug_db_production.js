const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkTable() {
  console.log('Testing insert with razorpay_payment_id into counselling_bookings...');
  const { error } = await supabase
    .from('counselling_bookings')
    .insert({
      full_name: 'Debug Test',
      email: 'debug@test.com',
      mobile: '1234567890',
      order_id: 'test-id',
      razorpay_payment_id: 'pay_test'
    });
  
  if (error) {
    console.error('Insert failed:', error.message);
  } else {
    console.log('✅ Success! razorpay_payment_id column exists.');
    await supabase.from('counselling_bookings').delete().eq('full_name', 'Debug Test');
  }
}

checkTable();
