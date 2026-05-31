const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.SUPABASE_URL || 'https://rlqmdylbzapyepuwncwt.supabase.co';
const key = process.env.SUPABASE_ANON_KEY;

if (!key) {
  console.error("Error: SUPABASE_ANON_KEY is not defined in .env");
  process.exit(1);
}

const supabase = createClient(url, key);

async function testTrigger() {
  console.log('=== Testing Manual Premium Activation Trigger ===');
  
  const testMobile = '8888888888';
  
  try {
    // 1. Clean up existing test user if any
    await supabase
      .from('preference_maker_users')
      .delete()
      .eq('mobile', testMobile);
      
    // 2. Insert as free user with some attempts used
    console.log('Inserting test user as a FREE user...');
    const { data: user, error: insErr } = await supabase
      .from('preference_maker_users')
      .insert({
        name: 'Trigger Test User',
        mobile: testMobile,
        category: 'General',
        score: 0,
        rank: 0,
        domicile: 'N/A',
        course: 'MBBS',
        plan_type: 'free',
        payment_status: 'unpaid',
        attempts_used: 2,
        max_attempts: 3,
        lists_remaining: 0
      })
      .select()
      .single();
      
    if (insErr) throw insErr;
    console.log('Inserted:', { plan_type: user.plan_type, payment_status: user.payment_status, attempts_used: user.attempts_used, max_attempts: user.max_attempts, lists_remaining: user.lists_remaining });
    
    // 3. Manually activate premium
    console.log('\nActivating PREMIUM status manually (plan_type = premium, payment_status = paid)...');
    const { data: updatedUser, error: updErr } = await supabase
      .from('preference_maker_users')
      .update({
        plan_type: 'premium',
        payment_status: 'paid'
      })
      .eq('mobile', testMobile)
      .select()
      .single();
      
    if (updErr) throw updErr;
    console.log('Updated user fields:');
    console.log('- plan_type:', updatedUser.plan_type);
    console.log('- payment_status:', updatedUser.payment_status);
    console.log('- attempts_used:', updatedUser.attempts_used);
    console.log('- max_attempts (Expected 5 since attempts_used was 2):', updatedUser.max_attempts);
    console.log('- lists_remaining (Expected 3):', updatedUser.lists_remaining);
    
    // Asserts
    if (updatedUser.lists_remaining === 3 && updatedUser.max_attempts === 5) {
      console.log('\n✅ SUCCESS: Manual premium trigger is working perfectly!');
    } else {
      console.error('\n❌ FAILURE: Trigger did not allocate correct values.');
    }
    
    // Cleanup
    await supabase
      .from('preference_maker_users')
      .delete()
      .eq('mobile', testMobile);
      
  } catch (err) {
    console.error('Error during trigger verification:', err.message);
  }
}

testTrigger();
