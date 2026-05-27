const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.SUPABASE_URL || 'https://rlqmdylbzapyepuwncwt.supabase.co';
const key = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function dump() {
  const { data, error } = await supabase
    .from('college_preferences')
    .select('id, college_name, state, fees')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log(`Total fetched: ${data.length}`);
    const fs = require('fs');
    const content = data.map((c, i) => `${i + 1}. ID: ${c.id} | Name: ${c.college_name} | State: ${c.state} | Fees: ${c.fees}`).join('\n');
    fs.writeFileSync('scratch/all_colleges.txt', content);
    console.log('✅ Dumped to scratch/all_colleges.txt');
  }
}

dump();
