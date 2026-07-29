const fs = require('fs');

const rawData = fs.readFileSync('scratch/bds_data.json', 'utf8');
const records = JSON.parse(rawData);

let sql = '-- Step 1: Insert BDS colleges\n';
sql += 'INSERT INTO college_preferences (college_name, state, fees, bond_details) VALUES\n';

const values = records.map(r => {
  const name = r.college_name.replace(/'/g, "''");
  const state = r.state.replace(/'/g, "''");
  const fees = r.fees === null ? 0 : r.fees;
  const bond = 'N/A'; // Default bond to N/A as it wasn't provided
  return `  ('${name}', '${state}', ${fees}, '${bond}')`;
});

sql += values.join(',\n') + ';\n';

fs.writeFileSync('scratch/migration_bds_colleges.sql', sql);
console.log('SQL migration generated: scratch/migration_bds_colleges.sql with ' + records.length + ' records.');
