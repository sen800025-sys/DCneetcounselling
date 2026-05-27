const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.SUPABASE_URL || 'https://rlqmdylbzapyepuwncwt.supabase.co';
const key = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function findDuplicates() {
  const { data, error } = await supabase
    .from('college_preferences')
    .select('id, college_name, state, fees');

  if (error) {
    console.error('Error fetching colleges:', error.message);
    return;
  }

  console.log(`Total colleges fetched: ${data.length}`);

  const nameMap = {};
  data.forEach(item => {
    const key = item.college_name.toLowerCase().trim();
    if (!nameMap[key]) {
      nameMap[key] = [];
    }
    nameMap[key].push(item);
  });

  let duplicateGroupCount = 0;
  let totalDuplicateRows = 0;

  Object.keys(nameMap).forEach(key => {
    const list = nameMap[key];
    if (list.length > 1) {
      duplicateGroupCount++;
      totalDuplicateRows += (list.length - 1);
      console.log(`\nDuplicate Group ${duplicateGroupCount} (key: "${key}"):`);
      list.forEach(c => {
        console.log(`  - ID: ${c.id} | "${c.college_name}" | State: ${c.state} | Fees: ${c.fees}`);
      });
    }
  });

  console.log(`\nSummary:`);
  console.log(`- Total duplicate groups: ${duplicateGroupCount}`);
  console.log(`- Total duplicate rows that can be removed: ${totalDuplicateRows}`);
  console.log(`- Remaining unique colleges: ${data.length - totalDuplicateRows}`);
}

findDuplicates();
