const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.SUPABASE_URL || 'https://rlqmdylbzapyepuwncwt.supabase.co';
const key = process.env.SUPABASE_ANON_KEY;

if (!key) {
  console.error("Error: SUPABASE_ANON_KEY is not defined in .env");
  process.exit(1);
}

const supabase = createClient(url, key);

async function verify() {
  console.log('Querying college_preferences...');
  const { data, error, count } = await supabase
    .from('college_preferences')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('Error fetching colleges:', error.message);
  } else {
    console.log(`✅ Success! Total colleges in database: ${count}`);
    console.log('\nSample records (first 5):');
    data.slice(0, 5).forEach((college, index) => {
      console.log(`${index + 1}. ${college.college_name} (${college.state}) - Fees: ₹${college.fees}`);
    });
  }
}

verify();
