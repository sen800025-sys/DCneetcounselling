const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.SUPABASE_URL || 'https://rlqmdylbzapyepuwncwt.supabase.co';
const key = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function check() {
  console.log('Querying college_preferences...');
  const { data, error } = await supabase
    .from('college_preferences')
    .select('id, college_name, state, fees, bond_details')
    .order('state', { ascending: true });

  if (error) {
    console.error('Error fetching colleges:', error.message);
    return;
  }

  // 1. Find all AIIMS colleges and print their bond details
  const aiims = data.filter(c => c.college_name.includes('AIIMS'));
  console.log(`\n--- AIIMS Colleges (${aiims.length}) ---`);
  aiims.forEach(c => {
    console.log(`[AIIMS] ${c.college_name} (${c.state}): ${c.bond_details}`);
  });

  // 2. Find all ESIC colleges and print their bond details
  const esic = data.filter(c => c.college_name.includes('ESIC'));
  console.log(`\n--- ESIC Colleges (${esic.length}) ---`);
  esic.forEach(c => {
    console.log(`[ESIC] ${c.college_name} (${c.state}): ${c.bond_details}`);
  });

  // 3. Find unique bond details for each state to verify consistency
  console.log('\n--- State Bond Consistency Check ---');
  const stateBonds = {};
  data.forEach(c => {
    if (c.college_name.includes('AIIMS')) return; // AIIMS has its own rule
    if (!stateBonds[c.state]) {
      stateBonds[c.state] = new Set();
    }
    stateBonds[c.state].add(c.bond_details);
  });

  let inconsistencies = 0;
  for (const [state, bonds] of Object.entries(stateBonds)) {
    if (bonds.size > 1) {
      console.log(`⚠️ Inconsistency in ${state}: distinct bonds found:`, Array.from(bonds));
      inconsistencies++;
    } else {
      console.log(`✅ ${state}: ${Array.from(bonds)[0]}`);
    }
  }
  console.log(`\nInconsistent states: ${inconsistencies}`);
}

check();
