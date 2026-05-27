const fs = require('fs');
const path = require('path');

const migrationsDir = 'c:\\Users\\rushi\\Downloads\\DCneetcounselling\\supabase\\migrations';
const files = fs.readdirSync(migrationsDir).sort();

let grandTotal = 0;

files.forEach(file => {
  if (file.endsWith('.sql') && file.includes('seed')) {
    const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    const matches = content.match(/\('[^']+',\s*'[^']+',\s*\d+\)/g);
    const count = matches ? matches.length : 0;
    grandTotal += count;
    console.log(`${file}: ${count} rows`);
  }
});

console.log(`Grand Total: ${grandTotal}`);
