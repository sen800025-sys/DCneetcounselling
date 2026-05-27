const fs = require('fs');

const logPath = 'C:\\Users\\rushi\\.gemini\\antigravity-ide\\brain\\d2c157e4-437e-418e-81f9-8b218997e771\\.system_generated\\logs\\transcript.jsonl';
const fileContent = fs.readFileSync(logPath, 'utf8');
const lines = fileContent.split('\n').filter(Boolean);

const userColleges = [];

lines.forEach((line, lineIndex) => {
  const step = JSON.parse(line);
  // Look for any step from user (or maybe model representing user data) containing college lists
  if (step.content) {
    const text = step.content;
    const rows = text.split('\n');
    rows.forEach(row => {
      if (row.includes('|') && !row.includes('---') && !row.toLowerCase().includes('college name')) {
        const parts = row.split('|').map(p => p.trim()).filter(Boolean);
        // We expect: [Name, State, Fees]
        if (parts.length >= 3) {
          const feesStr = parts[2].replace(/[^0-9]/g, '');
          if (feesStr && parts[0] && parts[1]) {
            const name = parts[0];
            const state = parts[1];
            const fees = parseInt(feesStr);
            if (name.length > 3 && state.length > 2 && fees > 100) {
              userColleges.push({
                name,
                state,
                fees,
                step: step.step_index,
                source: step.source
              });
            }
          }
        }
      }
    });
  }
});

console.log(`Parsed ${userColleges.length} entries from transcript.`);

// Deduplicate by name + state
const uniqueColleges = [];
const seen = new Set();
userColleges.forEach(c => {
  const key = `${c.name.toLowerCase().trim()}|${c.state.toLowerCase().trim()}`;
  if (!seen.has(key)) {
    seen.add(key);
    uniqueColleges.push(c);
  }
});

console.log(`Unique colleges parsed: ${uniqueColleges.length}`);
fs.writeFileSync('scratch/user_colleges_v2.json', JSON.stringify(uniqueColleges, null, 2));
