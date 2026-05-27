const { createClient } = require('@supabase/supabase-js');

const url = 'https://anqqmulbmeydetwpeudh.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFucXFtdWxibWV5ZGV0d3BldWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzODY1MTMsImV4cCI6MjA5Mzk2MjUxM30.AbfUID7hy1gg88C_j0OUk09G0XEW8uEqvJzD17u96ZA';

const supabase = createClient(url, key);

async function check() {
  console.log('Checking preference_maker_users...');
  const { data: data1, error: error1 } = await supabase.from('preference_maker_users').select('*').limit(1);
  if (error1) {
    console.log('preference_maker_users error:', error1.message);
  } else {
    console.log('preference_maker_users exists! Data:', data1);
  }

  console.log('Checking college_preferences...');
  const { data: data2, error: error2 } = await supabase.from('college_preferences').select('*').limit(1);
  if (error2) {
    console.log('college_preferences error:', error2.message);
  } else {
    console.log('college_preferences exists! Data:', data2);
  }
}

check();
