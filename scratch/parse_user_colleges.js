const fs = require('fs');

const logPath = 'C:\\Users\\rushi\\.gemini\\antigravity-ide\\brain\\d2c157e4-437e-418e-81f9-8b218997e771\\.system_generated\\logs\\transcript.jsonl';
const fileContent = fs.readFileSync(logPath, 'utf8');
const lines = fileContent.split('\n').filter(Boolean);

const userColleges = [];

lines.forEach(line => {
  const step = JSON.parse(line);
  if (step.source === 'USER_EXPLICIT' && step.type === 'USER_INPUT') {
    const text = step.content;
    const tableMatches = text.match(/\|\s*College Name\s*\|[\s\S]*?\n([\s\S]*?)(?:\n\n|\n*$)/g);
    if (tableMatches) {
      tableMatches.forEach(table => {
        const rows = table.split('\n');
        rows.forEach(row => {
          if (row.trim() === '' || row.includes('---') || row.includes('College Name')) return;
          const parts = row.split('|').map(p => p.trim()).filter(Boolean);
          if (parts.length >= 3) {
            const name = parts[0];
            const state = parts[1];
            const fees = parseInt(parts[2].replace(/[^0-9]/g, '')) || 0;
            if (name) {
              userColleges.push({ name, state, fees });
            }
          }
        });
      });
    }
  }
});

console.log(`Parsed ${userColleges.length} total colleges from all user messages.`);

// Count uniqueness in user messages
const uniqueUserMap = {};
userColleges.forEach(c => {
  const norm = c.name.toLowerCase().trim();
  if (!uniqueUserMap[norm]) {
    uniqueUserMap[norm] = [];
  }
  uniqueUserMap[norm].push(c);
});

console.log(`Unique colleges in user messages: ${Object.keys(uniqueUserMap).length}`);

// Write user colleges to file
fs.writeFileSync('scratch/user_colleges.json', JSON.stringify(userColleges, null, 2));
