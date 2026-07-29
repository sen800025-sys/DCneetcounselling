const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = 'https://rlqmdylbzapyepuwncwt.supabase.co';
const key = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function main() {
  const content = fs.readFileSync('scratch/bams_data.txt', 'utf8');
  const lines = content.split('\n');
  const records = [];

  for (let line of lines) {
    line = line.trim();
    if (!line || !line.startsWith('|')) continue;
    const parts = line.split('|').map(s => s.trim()).filter(s => s);
    if (parts.length >= 4) {
      const name = parts[0];
      const state = parts[1];
      let feesStr = parts[2].replace(/[?,]/g, '').trim();
      let fees = 0;
      if (!isNaN(parseInt(feesStr))) {
        fees = parseInt(feesStr);
      }
      const bond = parts[3];

      records.push({
        college_name: name,
        state: state,
        fees: fees,
        bond_details: bond
      });
    }
  }

  console.log('Parsed ' + records.length + ' colleges.');
  
  if (records.length > 0) {
    const { data, error } = await supabase.from('college_preferences').insert(records);
    if (error) {
      console.error('Error inserting:', error);
    } else {
      console.log('Successfully inserted all colleges.');
    }
  }
}

main();
