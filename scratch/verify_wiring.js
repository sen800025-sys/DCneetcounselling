const fs = require('fs');
const indexPath = 'c:\\Users\\rushi\\Downloads\\DCneetcounselling\\frontend\\web\\index.html';
const c = fs.readFileSync(indexPath, 'utf8');

const s = c.indexOf('id="section-predictor"');
const scriptStart = c.indexOf('<script>', s);
const scriptEnd = c.indexOf('</script>', scriptStart);
const block = c.substring(scriptStart, scriptEnd + 9);

// Check for key patterns
console.log('Has openPredictorLeadPopup call:', block.includes('openPredictorLeadPopup'));
console.log('Has triggerPrediction:', block.includes('triggerPrediction'));
console.log('Has predictBtn click:', block.includes("predictBtn.addEventListener('click'"));

// Show the click handler area
const clickIdx = block.indexOf("predictBtn.addEventListener");
if (clickIdx !== -1) {
  console.log('\n--- Click handler area ---');
  console.log(block.substring(clickIdx, clickIdx + 300));
}
