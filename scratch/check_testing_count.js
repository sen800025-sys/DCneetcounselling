const { createClient } = require('@supabase/supabase-js');

const url = 'https://anqqmulbmeydetwpeudh.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFucXFtdWxibWV5ZGV0d3BldWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzODY1MTMsImV4cCI6MjA5Mzk2MjUxM30.AbfUID7hy1gg88C_j0OUk09G0XEW8uEqvJzD17u96ZA';

const supabase = createClient(url, key);

async function check() {
  const { data, error, count } = await supabase.from('college_preferences').select('*', { count: 'exact' });
  if (error) {
    console.log('Testing DB check error:', error.message);
  } else {
    console.log(`Testing DB has ${count} records!`);
  }
}

check();
