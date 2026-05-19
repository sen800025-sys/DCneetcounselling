const fs = require('fs');
const indexPath = 'c:\\Users\\rushi\\Downloads\\DCneetcounselling\\frontend\\web\\index.html';

try {
  let content = fs.readFileSync(indexPath, 'utf8');

  // 1. Update the air-result-rank CSS rule to prevent wrapping and allow breathing room
  const cssTarget = `.air-result-rank {
  font-size: 120px;
  font-weight: 900;
  letter-spacing: -4px;
  line-height: 1;`;

  const cssReplacement = `.air-result-rank {
  font-size: 120px;
  font-weight: 900;
  letter-spacing: -4px;
  line-height: 1.1;
  white-space: nowrap;
  display: block;
  width: 100%;`;

  if (content.includes(cssTarget)) {
    content = content.replace(cssTarget, cssReplacement);
    console.log('CSS Rule for air-result-rank updated.');
  } else {
    // Try alternate spaces/lines
    const altTarget = `air-result-rank {\n  font-size: 120px;`;
    if (content.includes(altTarget)) {
      content = content.replace(altTarget, `air-result-rank {\n  white-space: nowrap;\n  display: block;\n  width: 100%;\n  font-size: 120px;`);
      console.log('CSS Rule for air-result-rank updated (alt).');
    }
  }

  // 2. Inject dynamic font-size adjustment in showResultReveal
  const functionTarget = `  function showResultReveal(minRank, maxRank, score) {
    var resultContainer = document.getElementById('airResultContainer');
    var rankEl = document.getElementById('airResultRank');`;

  const functionReplacement = `  function showResultReveal(minRank, maxRank, score) {
    var resultContainer = document.getElementById('airResultContainer');
    var rankEl = document.getElementById('airResultRank');

    // Dynamic font size adjustment based on text length to fit screen perfectly
    function adjustRankFontSize(text) {
      var len = text.length;
      var isMobile = window.innerWidth <= 768;
      
      if (isMobile) {
        if (len > 18) {
          rankEl.style.fontSize = '34px';
          rankEl.style.letterSpacing = '-0.5px';
        } else if (len > 14) {
          rankEl.style.fontSize = '40px';
          rankEl.style.letterSpacing = '-1px';
        } else if (len > 10) {
          rankEl.style.fontSize = '48px';
          rankEl.style.letterSpacing = '-1.5px';
        } else {
          rankEl.style.fontSize = '56px';
          rankEl.style.letterSpacing = '-2px';
        }
      } else {
        if (len > 18) {
          rankEl.style.fontSize = '68px';
          rankEl.style.letterSpacing = '-2px';
        } else if (len > 14) {
          rankEl.style.fontSize = '84px';
          rankEl.style.letterSpacing = '-3px';
        } else if (len > 10) {
          rankEl.style.fontSize = '100px';
          rankEl.style.letterSpacing = '-4px';
        } else {
          rankEl.style.fontSize = '120px';
          rankEl.style.letterSpacing = '-4px';
        }
      }
    }`;

  if (content.includes(functionTarget)) {
    content = content.replace(functionTarget, functionReplacement);
    console.log('Dynamic adjustRankFontSize function injected.');
  }

  // 3. Call adjustRankFontSize inside the count-up timer and at the end of count-up
  const timerTarget = `      var curMin = Math.round(minRank * eased);
      var curMax = Math.round(maxRank * eased);
      rankEl.textContent = curMin.toLocaleString() + ' \\u2013 ' + curMax.toLocaleString();

      if (currentStep >= steps) {
        clearInterval(timer);
        rankEl.textContent = minRank.toLocaleString() + ' \\u2013 ' + maxRank.toLocaleString();
      }`;

  const timerReplacement = `      var curMin = Math.round(minRank * eased);
      var curMax = Math.round(maxRank * eased);
      var textVal = curMin.toLocaleString() + ' \\u2013 ' + curMax.toLocaleString();
      rankEl.textContent = textVal;
      adjustRankFontSize(textVal);

      if (currentStep >= steps) {
        clearInterval(timer);
        var finalVal = minRank.toLocaleString() + ' \\u2013 ' + maxRank.toLocaleString();
        rankEl.textContent = finalVal;
        adjustRankFontSize(finalVal);
      }`;

  if (content.includes(timerTarget)) {
    content = content.replace(timerTarget, timerReplacement);
    console.log('Interval calls to adjustRankFontSize added.');
  }

  fs.writeFileSync(indexPath, content, 'utf8');
  console.log('Successfully completed all modifications for responsive rank display!');

} catch (error) {
  console.error('Error during modification:', error);
}
