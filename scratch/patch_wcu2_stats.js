const fs = require('fs');
const p = 'frontend/web/index.html';
let content = fs.readFileSync(p, 'utf8');

const regexStats = /\.wcu2-stats\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*1fr 1fr;\s*border-radius:\s*24px;\s*padding:\s*20px;\s*gap:\s*14px;\s*\}/;

const replacementStats = `.wcu2-stats {
              display: grid;
              grid-template-columns: 1fr 1fr;
              border-radius: 24px;
              padding: 20px;
              gap: 14px;
              align-items: stretch;
            }`;

if (regexStats.test(content)) {
    content = content.replace(regexStats, replacementStats);
    fs.writeFileSync(p, content);
    console.log('SUCCESS: Patched wcu2-stats align-items');
} else {
    console.log('FAILED TO FIND wcu2-stats');
}

