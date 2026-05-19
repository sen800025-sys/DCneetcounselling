const fs = require('fs');
const indexPath = 'c:\\Users\\rushi\\Downloads\\DCneetcounselling\\frontend\\web\\index.html';

let content = fs.readFileSync(indexPath, 'utf8');

// Find the predictor section script
const sectionStart = content.indexOf('id="section-predictor"');
const scriptStart = content.indexOf('<script>', sectionStart);
const scriptEnd = content.indexOf('</script>', scriptStart);
const scriptBlock = content.substring(scriptStart, scriptEnd + 9);

// Show area around updateSliderBackground to find insertion point
const usbIdx = scriptBlock.indexOf('updateSliderBackground();');
// Find the LAST occurrence (standalone call, not the function definition)
const allOccurrences = [];
let searchFrom = 0;
while (true) {
  const idx = scriptBlock.indexOf('updateSliderBackground();', searchFrom);
  if (idx === -1) break;
  allOccurrences.push(idx);
  searchFrom = idx + 1;
}

console.log('Found updateSliderBackground() calls at positions:', allOccurrences);

// Show context around each
allOccurrences.forEach((idx, i) => {
  console.log(`\n--- Occurrence ${i + 1} (pos ${idx}) ---`);
  console.log(scriptBlock.substring(idx, idx + 200));
});

// Show area around window.triggerPrediction
const trigIdx = scriptBlock.indexOf('window.triggerPrediction');
if (trigIdx !== -1) {
  console.log('\n--- triggerPrediction area ---');
  console.log(scriptBlock.substring(trigIdx - 100, trigIdx + 200));
}
