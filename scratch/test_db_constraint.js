const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = 'https://rlqmdylbzapyepuwncwt.supabase.co';
const key = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function testConstraint() {
  console.log('Testing attempts check constraint for premium users...');
  
  // Update user with mobile 6666666666 (Zzz) to attempts_used = 11
  const { data, error } = await supabase
    .from('preference_maker_users')
    .update({ attempts_used: 11 })
    .eq('mobile', '6666666666')
    .select();
    
  if (error) {
    console.error('❌ Constraint test failed:', error.message);
  } else {
    console.log('✅ Constraint test succeeded! Updated premium user attempts_used to 11:', data[0]);
    // Reset back to 10
    await supabase
      .from('preference_maker_users')
      .update({ attempts_used: 10 })
      .eq('mobile', '6666666666');
  }
}

testConstraint();
