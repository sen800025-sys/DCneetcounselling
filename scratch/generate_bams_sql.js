const fs = require('fs');
const content = fs.readFileSync('scratch/bams_data.txt', 'utf8');
const lines = content.split('\n');
const records = [];

for (let line of lines) {
  line = line.trim();
  if (!line || !line.startsWith('|')) continue;
  const parts = line.split('|').map(s => s.trim()).filter(s => s);
  if (parts.length >= 4) {
    const name = parts[0].replace(/'/g, "''");
    const state = parts[1].replace(/'/g, "''");
    let feesStr = parts[2].replace(/[₹,]/g, '').trim();
    let fees = 0;
    if (!isNaN(parseInt(feesStr))) {
      fees = parseInt(feesStr);
    }
    const bond = parts[3].replace(/'/g, "''");

    records.push({ name, state, fees, bond });
  }
}

let sql = 'INSERT INTO college_preferences (college_name, state, fees, bond_details) VALUES\n';
const values = records.map(r => `  ('${r.name}', '${r.state}', ${r.fees}, '${r.bond}')`);
sql += values.join(',\n') + ';\n';

fs.writeFileSync('scratch/migration_bams_colleges.sql', sql);
console.log('SQL migration generated: scratch/migration_bams_colleges.sql with ' + records.length + ' records.');
