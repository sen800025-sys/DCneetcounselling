const fs = require('fs');

const rawData = fs.readFileSync('scratch/bams_data_v3.json', 'utf8');
const records = JSON.parse(rawData);

const namesToDelete = records.map(r => `'${r.college_name.replace(/'/g, "''")}'`);

let sql = '-- Step 1: Delete any previously added BAMS colleges\n';
sql += 'DELETE FROM college_preferences\n';
sql += 'WHERE college_name IN (\n  ' + namesToDelete.join(',\n  ') + '\n);\n\n';

sql += '-- Step 2: Insert the new updated BAMS colleges\n';
sql += 'INSERT INTO college_preferences (college_name, state, fees, bond_details) VALUES\n';

const values = records.map(r => {
  const name = r.college_name.replace(/'/g, "''");
  const state = r.state.replace(/'/g, "''");
  const fees = r.fees_per_year === null ? 0 : r.fees_per_year;
  const bond = r.bond_details.replace(/'/g, "''");
  return `  ('${name}', '${state}', ${fees}, '${bond}')`;
});

sql += values.join(',\n') + ';\n';

fs.writeFileSync('scratch/migration_bams_colleges_v2.sql', sql);
console.log('Generated SQL migration: scratch/migration_bams_colleges_v2.sql');
