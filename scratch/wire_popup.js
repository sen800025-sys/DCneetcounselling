const fs = require('fs');
const indexPath = 'c:\\Users\\rushi\\Downloads\\DCneetcounselling\\frontend\\web\\index.html';

let content = fs.readFileSync(indexPath, 'utf8');

// Find the exact target string and insert popup opener before it
const target = `const loadingTexts = [
            "Analyzing NEET trends..."`;

const replacement = `// Open lead popup when predict button is clicked
          predictBtn.addEventListener('click', function() {
            if (window.openPredictorLeadPopup) {
              window.openPredictorLeadPopup();
            }
          });

          const loadingTexts = [
            "Analyzing NEET trends..."`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(indexPath, content, 'utf8');
  console.log('Successfully wired predict button to popup!');
} else {
  console.log('Target not found. Trying alternate...');
  // Try with different quotes
  const alt = 'const loadingTexts = [';
  const sIdx = content.indexOf('id="section-predictor"');
  const aIdx = content.indexOf(alt, sIdx);
  if (aIdx !== -1) {
    content = content.substring(0, aIdx) + 
      `// Open lead popup when predict button is clicked
          predictBtn.addEventListener('click', function() {
            if (window.openPredictorLeadPopup) {
              window.openPredictorLeadPopup();
            }
          });

          ` + content.substring(aIdx);
    fs.writeFileSync(indexPath, content, 'utf8');
    console.log('Successfully wired predict button to popup (alt method)!');
  } else {
    console.log('Could not find insertion point.');
  }
}
