const fs = require('fs');
const path = require('path');

const migrationsDir = 'c:\\Users\\rushi\\Downloads\\DCneetcounselling\\supabase\\migrations';
const files = fs.readdirSync(migrationsDir);

let totalInserted = 0;
const insertedColleges = [];

files.forEach(file => {
  if (file.endsWith('.sql') && file.includes('seed')) {
    const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    // Find all insert rows: ('Name', 'State', Fees)
    const matches = content.match(/\('[^']+',\s*'[^']+',\s*\d+\)/g);
    if (matches) {
      totalInserted += matches.length;
      matches.forEach(m => {
        const parts = m.match(/\('([^']+)',\s*'([^']*)',\s*(\d+)\)/);
        if (parts) {
          insertedColleges.push({
            file,
            name: parts[1],
            state: parts[2],
            fees: parseInt(parts[3])
          });
        }
      });
    }
  }
});

console.log(`Total inserted in SQL files: ${totalInserted}`);

// Check for duplicates in the SQL files
const countMap = {};
insertedColleges.forEach(c => {
  const key = c.name.toLowerCase().trim();
  if (!countMap[key]) {
    countMap[key] = [];
  }
  countMap[key].push(c);
});

let duplicates = 0;
Object.keys(countMap).forEach(key => {
  if (countMap[key].length > 1) {
    duplicates += countMap[key].length - 1;
    console.log(`Duplicate name: "${key}" (${countMap[key].length} times)`);
    countMap[key].forEach(c => {
      console.log(`  - File: ${c.file} | State: ${c.state} | Fees: ${c.fees}`);
    });
  }
});

console.log(`Total duplicate entries in seed files: ${duplicates}`);
console.log(`Expected unique count if all duplicates are removed: ${totalInserted - duplicates}`);
