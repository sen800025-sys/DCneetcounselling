const fs = require('fs');

// 1. Get Old Names (from the first text file we used)
const oldContent = fs.readFileSync('scratch/bams_data.txt', 'utf8');
const oldLines = oldContent.split('\n');
const oldNames = [];
for (let line of oldLines) {
  line = line.trim();
  if (!line || !line.startsWith('|')) continue;
  const parts = line.split('|').map(s => s.trim()).filter(s => s);
  if (parts.length >= 4) {
    oldNames.push(parts[0].replace(/'/g, "''"));
  }
}

// 2. Get New Names (from the new JSON file)
const newContent = fs.readFileSync('scratch/bams_data_v3.json', 'utf8');
const newRecords = JSON.parse(newContent);
const newNames = newRecords.map(r => r.college_name.replace(/'/g, "''"));

// Combine and deduplicate names to delete
const allNamesToDelete = Array.from(new Set([...oldNames, ...newNames]));

let sql = '-- Step 1: Cleanly wipe ALL BAMS colleges (both old typos and new ones)\n';
sql += 'DELETE FROM college_preferences\n';
sql += 'WHERE college_name IN (\n  ' + allNamesToDelete.map(n => `'${n}'`).join(',\n  ') + '\n);\n\n';

sql += '-- Step 2: Insert strictly the 90 exact colleges you provided\n';
sql += 'INSERT INTO college_preferences (college_name, state, fees, bond_details) VALUES\n';

const values = newRecords.map(r => {
  const name = r.college_name.replace(/'/g, "''");
  const state = r.state.replace(/'/g, "''");
  const fees = r.fees_per_year === null ? 0 : r.fees_per_year;
  const bond = r.bond_details.replace(/'/g, "''");
  return `  ('${name}', '${state}', ${fees}, '${bond}')`;
});

sql += values.join(',\n') + ';\n';

fs.writeFileSync('scratch/migration_bams_colleges_final.sql', sql);
console.log('Final SQL generated with ' + allNamesToDelete.length + ' names to delete and ' + newRecords.length + ' to insert.');
