const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.SUPABASE_URL || 'https://rlqmdylbzapyepuwncwt.supabase.co';
const key = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function check() {
  const { data, error, count } = await supabase.from('colleges').select('*', { count: 'exact' });
  if (error) {
    console.log('Error querying colleges table:', error.message);
  } else {
    console.log(`Table "colleges" has ${count} records!`);
  }
}

check();
