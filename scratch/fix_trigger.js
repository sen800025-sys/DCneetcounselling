const fs = require('fs');
const indexPath = 'c:\\Users\\rushi\\Downloads\\DCneetcounselling\\frontend\\web\\index.html';

let content = fs.readFileSync(indexPath, 'utf8');

// Find the triggerPrediction function and replace it with a clean version
const oldTriggerStart = `// Expose the actual prediction trigger for the popup
          window.triggerPrediction = function() {
            const score = parseInt(slider.value, 10);
            const { predictedRank, minRank, maxRank } = predictRank(score);

            // Disable button`;

const sIdx = content.indexOf('window.triggerPrediction = function()');
if (sIdx === -1) {
  console.log('triggerPrediction not found');
  process.exit(1);
}

// Find the end of this function - look for the closing of showResult function which ends the block
const showResultEnd = content.indexOf("          }\n        })();", sIdx);
if (showResultEnd === -1) {
  console.log('Could not find end marker');
  process.exit(1);
}

const oldBlock = content.substring(sIdx, showResultEnd + 24);

const newBlock = `window.triggerPrediction = function() {
            const score = parseInt(slider.value, 10);
            const { predictedRank, minRank, maxRank } = predictRank(score);

            // Show result directly (loading was handled by popup)
            resultSection.style.display = 'block';
            resultSection.style.opacity = '0';
            resultSection.style.transform = 'translateY(20px)';

            requestAnimationFrame(function() {
              resultSection.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
              resultSection.style.opacity = '1';
              resultSection.style.transform = 'translateY(0)';
            });

            // Animate count-up for range
            const duration = 1800;
            const stepTime = 20;
            const steps = duration / stepTime;
            let currentStep = 0;

            const timer = setInterval(function() {
              currentStep++;
              const progress = currentStep / steps;
              const easedProgress = 1 - Math.pow(1 - progress, 3);

              const currentMin = Math.round(minRank * easedProgress);
              const currentMax = Math.round(maxRank * easedProgress);

              rankResult.textContent = 'AIR ' + currentMin.toLocaleString() + ' - ' + currentMax.toLocaleString();

              if (currentStep >= steps) {
                clearInterval(timer);
                rankResult.textContent = 'AIR ' + minRank.toLocaleString() + ' - ' + maxRank.toLocaleString();
              }
            }, stepTime);

            setTimeout(function() {
              resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 200);
          };
        })();`;

content = content.substring(0, sIdx) + newBlock + content.substring(showResultEnd + 24);

fs.writeFileSync(indexPath, content, 'utf8');
console.log('Successfully cleaned up triggerPrediction function!');
