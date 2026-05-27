const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.SUPABASE_URL || 'https://rlqmdylbzapyepuwncwt.supabase.co';
const key = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.from('college_preferences').select('college_name');
  if (error) {
    console.log('Error:', error.message);
  } else {
    const names = data.map(d => d.college_name);
    const uniqueNames = new Set(names);
    console.log(`Total records: ${names.length}`);
    console.log(`Unique college names: ${uniqueNames.size}`);
    
    // Find duplicate names
    const countMap = {};
    names.forEach(name => {
      countMap[name] = (countMap[name] || 0) + 1;
    });
    
    const duplicates = [];
    Object.keys(countMap).forEach(name => {
      if (countMap[name] > 1) {
        duplicates.push({ name, count: countMap[name] });
      }
    });
    
    console.log('Duplicate names found:', duplicates);
  }
}

check();
