const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = 'https://rlqmdylbzapyepuwncwt.supabase.co';
const key = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function listColumns() {
  console.log('Querying preference_maker_users schema/data...');
  const { data: data1, error: error1 } = await supabase.from('preference_maker_users').select('*').limit(1);
  if (error1) {
    console.error('Error fetching users data:', error1);
  } else {
    console.log('preference_maker_users columns:', data1[0] ? Object.keys(data1[0]) : 'No rows found');
  }

  console.log('Querying preference_maker_lists schema/data...');
  const { data: data2, error: error2 } = await supabase.from('preference_maker_lists').select('*').limit(1);
  if (error2) {
    console.error('Error fetching lists data:', error2);
  } else {
    console.log('preference_maker_lists columns:', data2[0] ? Object.keys(data2[0]) : 'No rows found');
  }
}

listColumns();
