const fs = require('fs');
const indexPath = 'c:\\Users\\rushi\\Downloads\\DCneetcounselling\\frontend\\web\\index.html';

try {
  let content = fs.readFileSync(indexPath, 'utf8');

  // Find the old script block inside section-predictor
  const sectionStart = content.indexOf('id="section-predictor"');
  const scriptStart = content.indexOf('<script>', sectionStart);
  const scriptEnd = content.indexOf('</script>', scriptStart) + 9;

  // Also update the HTML structure for the result card
  const resultBadgeOld = `<div class="predictor-result-badge">YOUR PREDICTED RANK</div>`;
  const resultBadgeNew = `<div class="predictor-result-badge">YOUR PREDICTED AIR</div>`;
  content = content.replace(resultBadgeOld, resultBadgeNew);

  const resultLabelOld = `<div class="predictor-result-label">ESTIMATED ALL INDIA RANK</div>`;
  const resultLabelNew = `<div class="predictor-result-label">ESTIMATED ALL INDIA RANK RANGE</div>`;
  content = content.replace(resultLabelOld, resultLabelNew);

  // Also try the typo version
  content = content.replace(
    `<div class="predictor-result-label">ESTIMATED ALL India RANK</div>`,
    `<div class="predictor-result-label">ESTIMATED ALL INDIA RANK RANGE</div>`
  );

  const newScript = `<script>
        (function() {
          // ═══════════════════════════════════════════════════════════════
          // DC Rank Predictor Engine v2.0
          // Weighted Linear Interpolation with Historical NEET Data
          // ═══════════════════════════════════════════════════════════════

          // Historical NEET Score-to-Rank data (marks → approximate AIR)
          const historicalData = {
            "2025": [
              [720, 1], [715, 18], [710, 85], [705, 210], [700, 450],
              [695, 780], [690, 1250], [685, 1800], [680, 2500], [675, 3400],
              [670, 4500], [665, 5800], [660, 7200], [655, 8800], [650, 10500],
              [640, 14500], [630, 19000], [620, 24500], [610, 31000], [600, 38000],
              [580, 52000], [560, 68000], [540, 86000], [520, 108000], [500, 132000],
              [480, 160000], [460, 192000], [440, 228000], [420, 270000], [400, 318000],
              [380, 372000], [360, 430000], [340, 495000], [320, 565000], [300, 640000],
              [280, 720000], [260, 800000], [240, 880000], [220, 950000], [200, 1020000],
              [180, 1080000], [160, 1130000], [140, 1170000], [120, 1200000],
              [100, 1220000], [80, 1235000], [60, 1245000], [40, 1252000],
              [20, 1258000], [0, 1260000]
            ],
            "2024": [
              [720, 1], [715, 22], [710, 95], [705, 230], [700, 490],
              [695, 820], [690, 1350], [685, 1950], [680, 2700], [675, 3650],
              [670, 4800], [665, 6200], [660, 7700], [655, 9400], [650, 11200],
              [640, 15500], [630, 20500], [620, 26500], [610, 33500], [600, 41000],
              [580, 56000], [560, 73000], [540, 92000], [520, 115000], [500, 140000],
              [480, 170000], [460, 204000], [440, 242000], [420, 286000], [400, 336000],
              [380, 392000], [360, 452000], [340, 518000], [320, 590000], [300, 668000],
              [280, 750000], [260, 830000], [240, 905000], [220, 970000], [200, 1035000],
              [180, 1090000], [160, 1140000], [140, 1180000], [120, 1210000],
              [100, 1232000], [80, 1248000], [60, 1258000], [40, 1265000],
              [20, 1270000], [0, 1275000]
            ],
            "2023": [
              [720, 1], [715, 20], [710, 90], [705, 220], [700, 470],
              [695, 800], [690, 1300], [685, 1900], [680, 2600], [675, 3500],
              [670, 4600], [665, 6000], [660, 7500], [655, 9200], [650, 11000],
              [640, 15200], [630, 20000], [620, 25800], [610, 32500], [600, 40000],
              [580, 55000], [560, 71000], [540, 89000], [520, 112000], [500, 137000],
              [480, 166000], [460, 200000], [440, 238000], [420, 282000], [400, 332000],
              [380, 388000], [360, 448000], [340, 514000], [320, 585000], [300, 660000],
              [280, 740000], [260, 820000], [240, 895000], [220, 960000], [200, 1025000],
              [180, 1080000], [160, 1128000], [140, 1168000], [120, 1198000],
              [100, 1220000], [80, 1238000], [60, 1250000], [40, 1258000],
              [20, 1264000], [0, 1268000]
            ],
            "2022": [
              [720, 1], [715, 15], [710, 80], [705, 200], [700, 430],
              [695, 750], [690, 1200], [685, 1750], [680, 2400], [675, 3300],
              [670, 4400], [665, 5700], [660, 7100], [655, 8600], [650, 10300],
              [640, 14200], [630, 18800], [620, 24200], [610, 30500], [600, 37500],
              [580, 51000], [560, 66000], [540, 84000], [520, 105000], [500, 129000],
              [480, 157000], [460, 189000], [440, 225000], [420, 266000], [400, 313000],
              [380, 366000], [360, 424000], [340, 488000], [320, 558000], [300, 632000],
              [280, 712000], [260, 792000], [240, 868000], [220, 938000], [200, 1005000],
              [180, 1062000], [160, 1112000], [140, 1155000], [120, 1188000],
              [100, 1212000], [80, 1230000], [60, 1242000], [40, 1250000],
              [20, 1256000], [0, 1260000]
            ],
            "2021": [
              [720, 1], [715, 12], [710, 70], [705, 180], [700, 400],
              [695, 700], [690, 1150], [685, 1650], [680, 2300], [675, 3100],
              [670, 4100], [665, 5400], [660, 6800], [655, 8300], [650, 9900],
              [640, 13800], [630, 18200], [620, 23500], [610, 29800], [600, 36500],
              [580, 50000], [560, 64000], [540, 81000], [520, 102000], [500, 125000],
              [480, 152000], [460, 183000], [440, 218000], [420, 258000], [400, 304000],
              [380, 356000], [360, 412000], [340, 474000], [320, 542000], [300, 615000],
              [280, 694000], [260, 774000], [240, 850000], [220, 920000], [200, 988000],
              [180, 1048000], [160, 1100000], [140, 1145000], [120, 1180000],
              [100, 1206000], [80, 1225000], [60, 1238000], [40, 1247000],
              [20, 1254000], [0, 1258000]
            ],
            "2020": [
              [720, 1], [715, 10], [710, 65], [705, 170], [700, 380],
              [695, 680], [690, 1100], [685, 1600], [680, 2200], [675, 3000],
              [670, 4000], [665, 5200], [660, 6500], [655, 8000], [650, 9600],
              [640, 13500], [630, 17800], [620, 23000], [610, 29000], [600, 35500],
              [580, 48000], [560, 62000], [540, 79000], [520, 99000], [500, 122000],
              [480, 148000], [460, 178000], [440, 212000], [420, 252000], [400, 298000],
              [380, 350000], [360, 405000], [340, 465000], [320, 532000], [300, 604000],
              [280, 682000], [260, 760000], [240, 836000], [220, 908000], [200, 978000],
              [180, 1040000], [160, 1094000], [140, 1140000], [120, 1176000],
              [100, 1204000], [80, 1224000], [60, 1238000], [40, 1248000],
              [20, 1255000], [0, 1260000]
            ]
          };

          // Year weights (more recent years weigh heavier)
          const yearWeights = {
            "2025": 0.35,
            "2024": 0.25,
            "2023": 0.18,
            "2022": 0.12,
            "2021": 0.07,
            "2020": 0.03
          };

          // Rank range zones
          const rankRangeZones = [
            { minMarks: 680, maxMarks: 720, rangePercent: 2 },
            { minMarks: 620, maxMarks: 679, rangePercent: 5 },
            { minMarks: 500, maxMarks: 619, rangePercent: 8 },
            { minMarks: 0,   maxMarks: 499, rangePercent: 10 }
          ];

          // Linear interpolation for a single year
          function interpolateRank(data, marks) {
            // Data is sorted descending by marks
            if (marks >= data[0][0]) return data[0][1];
            if (marks <= data[data.length - 1][0]) return data[data.length - 1][1];

            for (let i = 0; i < data.length - 1; i++) {
              const [M2, R2] = data[i];     // upper
              const [M1, R1] = data[i + 1]; // lower
              if (marks <= M2 && marks >= M1) {
                // R = R1 + ((M - M1) / (M2 - M1)) * (R2 - R1)
                const ratio = (marks - M1) / (M2 - M1);
                return Math.round(R1 + ratio * (R2 - R1));
              }
            }
            return data[data.length - 1][1];
          }

          // Main prediction function
          function predictRank(marks) {
            let weightedRank = 0;
            let totalWeight = 0;

            const years = Object.keys(yearWeights);
            for (const year of years) {
              let w = yearWeights[year];
              const data = historicalData[year];
              if (!data) continue;

              let rank = interpolateRank(data, marks);

              // High score adjustment: boost recent year weight
              if (marks > 650) {
                if (parseInt(year) >= 2024) {
                  w *= 1.2;
                } else if (parseInt(year) <= 2021) {
                  w *= 0.8;
                }
              }

              weightedRank += rank * w;
              totalWeight += w;
            }

            const predictedRank = Math.round(weightedRank / totalWeight);

            // Calculate range
            let rangePercent = 10;
            for (const zone of rankRangeZones) {
              if (marks >= zone.minMarks && marks <= zone.maxMarks) {
                rangePercent = zone.rangePercent;
                break;
              }
            }

            const minRank = Math.max(1, Math.round(predictedRank - (predictedRank * rangePercent / 100)));
            const maxRank = Math.round(predictedRank + (predictedRank * rangePercent / 100));

            return { predictedRank, minRank, maxRank };
          }

          // ═══════════════════════════════════════════════════════════════
          // UI Integration
          // ═══════════════════════════════════════════════════════════════

          const slider = document.getElementById('predictorScoreSlider');
          const scoreValue = document.getElementById('predictorScoreValue');
          const predictBtn = document.getElementById('predictRankBtn');
          const resultSection = document.getElementById('predictorResultSection');
          const rankResult = document.getElementById('predictorRankResult');

          function updateSliderBackground() {
            const val = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
            slider.style.background =
              'linear-gradient(to right, #FFD233 0%, #FFC83D ' + (val * 0.25) + '%, #F29CFF ' + (val * 0.6) + '%, #B026FF ' + val + '%, rgba(255,255,255,0.12) ' + val + '%)';
          }

          slider.addEventListener('input', function() {
            scoreValue.textContent = this.value;
            updateSliderBackground();
            resultSection.style.display = 'none';
          });

          updateSliderBackground();

          const loadingTexts = [
            "Analyzing NEET trends...",
            "Calculating AIR range...",
            "Comparing previous year data...",
            "Generating prediction..."
          ];

          predictBtn.addEventListener('click', function() {
            const score = parseInt(slider.value, 10);
            const { predictedRank, minRank, maxRank } = predictRank(score);

            // Disable button and show loading sequence
            predictBtn.disabled = true;
            predictBtn.style.opacity = '0.8';
            resultSection.style.display = 'none';

            let loadIdx = 0;
            const originalText = predictBtn.innerHTML;
            
            function showNextLoading() {
              if (loadIdx < loadingTexts.length) {
                predictBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + loadingTexts[loadIdx];
                loadIdx++;
                setTimeout(showNextLoading, 450);
              } else {
                // Done loading, show results
                predictBtn.innerHTML = originalText;
                predictBtn.disabled = false;
                predictBtn.style.opacity = '1';
                showResult(minRank, maxRank);
              }
            }

            showNextLoading();
          });

          function showResult(minRank, maxRank) {
            resultSection.style.display = 'block';
            resultSection.style.opacity = '0';
            resultSection.style.transform = 'translateY(20px)';

            // Fade-up animation
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
              const easedProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic

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
            }, 100);
          }
        })();
      <\/script>`;

  if (scriptStart !== -1 && scriptEnd !== -1) {
    content = content.substring(0, scriptStart) + newScript + content.substring(scriptEnd);
    fs.writeFileSync(indexPath, content, 'utf8');
    console.log('Successfully updated predictor engine to v2.0.');
  } else {
    console.log('Script block not found in predictor section.');
  }
} catch (error) {
  console.error('Error modifying file:', error);
}
