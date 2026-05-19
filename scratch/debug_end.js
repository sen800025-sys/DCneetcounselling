const fs = require('fs');
const indexPath = 'c:\\Users\\rushi\\Downloads\\DCneetcounselling\\frontend\\web\\index.html';
const c = fs.readFileSync(indexPath, 'utf8');
const s = c.indexOf('id="section-predictor"');
const e = c.indexOf('</main>', s);
const block = c.substring(e - 300, e + 20);
console.log(block);
