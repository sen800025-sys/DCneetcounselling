const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = 'https://rlqmdylbzapyepuwncwt.supabase.co';
const key = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function listColumns() {
  console.log('Querying orders schema/data...');
  const { data, error } = await supabase.from('orders').select('*').limit(1);
  if (error) {
    console.error('Error fetching orders data:', error);
  } else {
    console.log('orders columns:', data[0] ? Object.keys(data[0]) : 'No rows found');
  }
}

listColumns();
