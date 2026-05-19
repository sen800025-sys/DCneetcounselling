const fs = require('fs');
const indexPath = 'c:\\Users\\rushi\\Downloads\\DCneetcounselling\\frontend\\web\\index.html';

try {
let content = fs.readFileSync(indexPath, 'utf8');

// 1. Remove old loading overlay if exists
if (content.includes('id="airLoadingOverlay"')) {
  const oldS = content.indexOf('<!-- AIR LOADING OVERLAY -->');
  const oldE = content.indexOf('<!-- END AIR LOADING OVERLAY -->');
  if (oldS !== -1 && oldE !== -1) {
    content = content.substring(0, oldS) + content.substring(oldE + 33);
  }
}

// 2. Insert loading overlay + enhanced result card before </body>
const loadingCode = `<!-- AIR LOADING OVERLAY -->
<style>
/* ═══════════════════════════════════════════════════════════
   AIR LOADING & REVEAL SYSTEM - Cinematic Premium
═══════════════════════════════════════════════════════════ */
.air-loading-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(8,0,20,0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  z-index: 999999;
  display: none;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.air-loading-overlay.active {
  display: flex;
  opacity: 1;
}
.air-loading-overlay.fade-out {
  opacity: 0;
}

/* Ambient glow blobs */
.air-glow-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
  animation: airBlobFloat 6s ease-in-out infinite alternate;
}
.air-glow-blob-1 {
  width: 400px; height: 400px;
  background: rgba(176,38,255,0.25);
  top: 10%; left: 10%;
}
.air-glow-blob-2 {
  width: 350px; height: 350px;
  background: rgba(255,210,51,0.18);
  bottom: 15%; right: 10%;
  animation-delay: -3s;
}
@keyframes airBlobFloat {
  0% { transform: translate(0,0) scale(1); }
  100% { transform: translate(30px,-20px) scale(1.15); }
}

/* Floating particles */
.air-particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.air-particle {
  position: absolute;
  width: 3px; height: 3px;
  background: rgba(176,38,255,0.6);
  border-radius: 50%;
  animation: airParticleRise linear infinite;
}
.air-particle:nth-child(odd) {
  background: rgba(255,210,51,0.5);
  width: 2px; height: 2px;
}
@keyframes airParticleRise {
  0% { transform: translateY(100vh) scale(0); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-10vh) scale(1); opacity: 0; }
}

/* Center card */
.air-loading-card {
  position: relative;
  z-index: 2;
  width: 420px;
  background: linear-gradient(180deg, rgba(42,0,82,0.94) 0%, rgba(24,0,45,0.96) 100%);
  border: 1px solid rgba(255,210,51,0.18);
  border-radius: 32px;
  box-shadow: 0 0 90px rgba(176,38,255,0.25);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  padding: 44px 32px 36px;
  text-align: center;
  font-family: 'Poppins', sans-serif;
}
.air-loading-card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 32px;
  padding: 1.5px;
  background: linear-gradient(135deg, rgba(255,210,51,0.35), rgba(176,38,255,0.35));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

/* Scanner ring */
.air-scanner-ring {
  width: 90px; height: 90px;
  margin: 0 auto 24px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.air-scanner-ring::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: #FFD233;
  border-right-color: #B026FF;
  animation: airScanSpin 2s linear infinite;
  filter: drop-shadow(0 0 12px rgba(255,210,51,0.5));
}
.air-scanner-ring::after {
  content: "";
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  border: 2px solid transparent;
  border-bottom-color: #D45BFF;
  border-left-color: #FFD233;
  animation: airScanSpin 3s linear infinite reverse;
  filter: drop-shadow(0 0 8px rgba(176,38,255,0.4));
}
.air-scanner-icon {
  font-size: 32px;
  z-index: 1;
  animation: airIconPulse 2s ease-in-out infinite;
  filter: drop-shadow(0 0 15px rgba(255,210,51,0.6));
}
@keyframes airScanSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes airIconPulse {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.12); opacity: 1; }
}

/* Heading */
.air-loading-heading {
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(90deg, #FFFFFF, #FFD233);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 8px;
  line-height: 1.3;
}

/* Analysis text */
.air-analysis-text {
  font-size: 14px;
  color: rgba(255,255,255,0.72);
  min-height: 22px;
  margin-bottom: 28px;
  transition: opacity 0.3s ease;
}

/* Progress bar */
.air-progress-wrap {
  width: 100%;
  height: 8px;
  background: rgba(255,255,255,0.08);
  border-radius: 999px;
  overflow: hidden;
  position: relative;
}
.air-progress-fill {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #FFD233, #E47CFF, #B026FF);
  border-radius: 999px;
  transition: width 0.3s ease;
  box-shadow: 0 0 24px rgba(255,210,51,0.4);
  position: relative;
}
.air-progress-fill::after {
  content: "";
  position: absolute;
  top: 0; right: 0;
  width: 30px; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4));
  border-radius: 999px;
}
.air-progress-pct {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  margin-top: 8px;
  font-weight: 600;
}

/* Flash effect */
.air-flash {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(255,210,51,0.3) 0%, transparent 70%);
  border-radius: 32px;
  opacity: 0;
  pointer-events: none;
  z-index: 3;
}
.air-flash.active {
  animation: airFlashPulse 0.6s ease-out;
}
@keyframes airFlashPulse {
  0% { opacity: 0; transform: scale(0.95); }
  30% { opacity: 1; }
  100% { opacity: 0; transform: scale(1.05); }
}

/* ═══ RESULT CARD ═══ */
.air-result-container {
  display: none;
  text-align: center;
  transform: scale(0.9);
  opacity: 0;
  transition: all 0.6s cubic-bezier(0.34,1.56,0.64,1);
}
.air-result-container.reveal {
  transform: scale(1);
  opacity: 1;
}

.air-result-badge-top {
  display: inline-block;
  background: rgba(34,0,66,0.9);
  border: 1px solid rgba(255,210,51,0.4);
  color: #FFD233;
  font-weight: 700;
  font-size: 14px;
  padding: 8px 22px;
  border-radius: 16px;
  margin-bottom: 12px;
  letter-spacing: 1px;
}

.air-result-rank {
  font-size: 120px;
  font-weight: 900;
  letter-spacing: -4px;
  line-height: 1;
  margin: 8px 0 16px;
  background: linear-gradient(180deg, #FFF3A0 0%, #FFD233 30%, #FFCC1A 60%, #F0A000 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 40px rgba(255,210,51,0.4));
  animation: airRankGlow 3s ease-in-out infinite;
}
@keyframes airRankGlow {
  0%, 100% { filter: drop-shadow(0 0 40px rgba(255,210,51,0.35)); }
  50% { filter: drop-shadow(0 0 55px rgba(255,210,51,0.55)); }
}

.air-result-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 16px;
}
.air-stat-pill {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 10px 18px;
  font-size: 13px;
  color: rgba(255,255,255,0.78);
  display: flex;
  align-items: center;
  gap: 6px;
}
.air-stat-pill .air-stat-icon {
  font-size: 16px;
}
.air-stat-pill strong {
  color: #FFD233;
  font-weight: 700;
}

.air-confidence-badge {
  display: inline-block;
  margin-top: 18px;
  padding: 8px 20px;
  background: linear-gradient(90deg, rgba(255,210,51,0.15), rgba(176,38,255,0.15));
  border: 1px solid rgba(255,210,51,0.3);
  border-radius: 12px;
  color: #FFD233;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 1px;
}

.air-result-note {
  margin-top: 14px;
  font-size: 14px;
  color: rgba(255,255,255,0.6);
  font-style: italic;
}

/* ═══ MOBILE ═══ */
@media (max-width: 768px) {
  .air-loading-card {
    width: 92%;
    padding: 32px 20px 28px;
    border-radius: 24px;
  }
  .air-loading-heading { font-size: 20px; }
  .air-analysis-text { font-size: 13px; }
  .air-scanner-ring { width: 72px; height: 72px; margin-bottom: 18px; }
  .air-scanner-icon { font-size: 26px; }
  .air-result-rank { font-size: 64px; letter-spacing: -2px; }
  .air-result-badge-top { font-size: 12px; padding: 6px 16px; }
  .air-stat-pill { font-size: 12px; padding: 8px 12px; }
  .air-confidence-badge { font-size: 11px; padding: 6px 14px; }
  .air-result-note { font-size: 12px; }
  .air-glow-blob-1 { width: 250px; height: 250px; }
  .air-glow-blob-2 { width: 200px; height: 200px; }
}
</style>

<!-- Loading Overlay HTML -->
<div class="air-loading-overlay" id="airLoadingOverlay">
  <!-- Ambient blobs -->
  <div class="air-glow-blob air-glow-blob-1"></div>
  <div class="air-glow-blob air-glow-blob-2"></div>

  <!-- Particles -->
  <div class="air-particles" id="airParticles"></div>

  <!-- Center Card -->
  <div class="air-loading-card" id="airLoadingCard">
    <div class="air-flash" id="airFlash"></div>

    <!-- Loading State -->
    <div id="airLoadingState">
      <div class="air-scanner-ring">
        <span class="air-scanner-icon">🎯</span>
      </div>
      <h2 class="air-loading-heading">Generating Your AIR Prediction</h2>
      <div class="air-analysis-text" id="airAnalysisText">Analyzing NEET score patterns...</div>
      <div class="air-progress-wrap">
        <div class="air-progress-fill" id="airProgressFill"></div>
      </div>
      <div class="air-progress-pct" id="airProgressPct">0%</div>
    </div>

    <!-- Result State (hidden initially) -->
    <div class="air-result-container" id="airResultContainer">
      <div class="air-result-badge-top">YOUR PREDICTED AIR</div>
      <div class="air-result-rank" id="airResultRank">--</div>
      <div id="airResultStats" class="air-result-stats"></div>
      <div class="air-confidence-badge" id="airConfBadge">⚡ HIGH CONFIDENCE</div>
      <div class="air-result-note" id="airResultNote"></div>
    </div>
  </div>
</div>

<script>
(function() {
  // Generate floating particles
  var particleContainer = document.getElementById('airParticles');
  if (particleContainer) {
    for (var i = 0; i < 20; i++) {
      var p = document.createElement('div');
      p.className = 'air-particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDuration = (4 + Math.random() * 6) + 's';
      p.style.animationDelay = (Math.random() * 5) + 's';
      particleContainer.appendChild(p);
    }
  }

  var analysisMessages = [
    "Analyzing NEET score patterns...",
    "Comparing previous year trends...",
    "Processing AIR distribution...",
    "Applying rank interpolation...",
    "Calculating prediction confidence...",
    "Finalizing AIR range..."
  ];

  window.showAIRLoadingAndReveal = function(minRank, maxRank, score) {
    var overlay = document.getElementById('airLoadingOverlay');
    var loadingState = document.getElementById('airLoadingState');
    var resultContainer = document.getElementById('airResultContainer');
    var progressFill = document.getElementById('airProgressFill');
    var progressPct = document.getElementById('airProgressPct');
    var analysisText = document.getElementById('airAnalysisText');
    var flash = document.getElementById('airFlash');

    // Reset states
    loadingState.style.display = 'block';
    resultContainer.style.display = 'none';
    resultContainer.classList.remove('reveal');
    progressFill.style.width = '0%';
    progressPct.textContent = '0%';

    // Show overlay
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function() {
      overlay.classList.add('active');
      overlay.classList.remove('fade-out');
    });

    // Analysis text rotation
    var msgIdx = 0;
    var msgInterval = setInterval(function() {
      msgIdx++;
      if (msgIdx >= analysisMessages.length) {
        clearInterval(msgInterval);
        return;
      }
      analysisText.style.opacity = '0';
      setTimeout(function() {
        analysisText.textContent = analysisMessages[msgIdx];
        analysisText.style.opacity = '1';
      }, 300);
    }, 1200);

    // Progress bar animation (5 seconds total)
    var totalDuration = 5000;
    var startTime = Date.now();
    var progressInterval = setInterval(function() {
      var elapsed = Date.now() - startTime;
      var pct = Math.min((elapsed / totalDuration) * 100, 100);
      // Ease out for realistic feel
      var easedPct = 100 * (1 - Math.pow(1 - pct / 100, 2.5));
      progressFill.style.width = easedPct + '%';
      progressPct.textContent = Math.round(easedPct) + '%';

      if (elapsed >= totalDuration) {
        clearInterval(progressInterval);
        progressFill.style.width = '100%';
        progressPct.textContent = '100%';

        // Flash effect
        setTimeout(function() {
          flash.classList.add('active');
          setTimeout(function() { flash.classList.remove('active'); }, 600);
        }, 200);

        // Transition to result
        setTimeout(function() {
          clearInterval(msgInterval);
          loadingState.style.opacity = '0';
          loadingState.style.transition = 'opacity 0.4s ease';

          setTimeout(function() {
            loadingState.style.display = 'none';
            loadingState.style.opacity = '1';
            loadingState.style.transition = '';
            showResultReveal(minRank, maxRank, score);
          }, 400);
        }, 500);
      }
    }, 50);
  };

  function showResultReveal(minRank, maxRank, score) {
    var resultContainer = document.getElementById('airResultContainer');
    var rankEl = document.getElementById('airResultRank');
    var statsEl = document.getElementById('airResultStats');
    var noteEl = document.getElementById('airResultNote');
    var confBadge = document.getElementById('airConfBadge');

    resultContainer.style.display = 'block';
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        resultContainer.classList.add('reveal');
      });
    });

    // Count-up animation
    var duration = 2000;
    var stepTime = 20;
    var steps = duration / stepTime;
    var currentStep = 0;

    var timer = setInterval(function() {
      currentStep++;
      var progress = currentStep / steps;
      // easeOutExpo
      var eased = 1 - Math.pow(2, -10 * progress);

      var curMin = Math.round(minRank * eased);
      var curMax = Math.round(maxRank * eased);
      rankEl.textContent = curMin.toLocaleString() + ' \\u2013 ' + curMax.toLocaleString();

      if (currentStep >= steps) {
        clearInterval(timer);
        rankEl.textContent = minRank.toLocaleString() + ' \\u2013 ' + maxRank.toLocaleString();
      }
    }, stepTime);

    // Calculate stats
    var totalStudents = 2400000;
    var percentile = ((totalStudents - maxRank) / totalStudents * 100).toFixed(1);
    var aheadOf = totalStudents - maxRank;
    var aheadOfLakh = (aheadOf / 100000).toFixed(1);

    var confidenceLevel = 'HIGH';
    var confIcon = '⚡';
    if (score >= 650) { confidenceLevel = 'VERY HIGH'; confIcon = '🔥'; }
    else if (score >= 500) { confidenceLevel = 'HIGH'; confIcon = '⚡'; }
    else if (score >= 350) { confidenceLevel = 'MODERATE'; confIcon = '📊'; }
    else { confidenceLevel = 'ESTIMATED'; confIcon = '📈'; }

    var collegeNote = '';
    if (score >= 600) collegeNote = 'Strong possibility for Government Medical Colleges.';
    else if (score >= 500) collegeNote = 'Good chances for Government/Private Medical Colleges.';
    else if (score >= 400) collegeNote = 'Possibilities in Private Medical Colleges.';
    else collegeNote = 'Consider preparation strategies for better rank.';

    // Populate stats
    statsEl.innerHTML =
      '<div class="air-stat-pill"><span class="air-stat-icon">🏆</span> Top <strong>' + percentile + '%</strong> of aspirants</div>' +
      '<div class="air-stat-pill"><span class="air-stat-icon">👥</span> Ahead of <strong>~' + aheadOfLakh + ' lakh</strong> students</div>';

    confBadge.textContent = confIcon + ' ' + confidenceLevel + ' CONFIDENCE';
    noteEl.textContent = collegeNote;

    // Also update the original result section on the page
    var oldResult = document.getElementById('predictorResultSection');
    var oldRank = document.getElementById('predictorRankResult');
    if (oldResult) oldResult.style.display = 'none';
  }

  // Close loading overlay (click outside or after delay)
  document.addEventListener('click', function(e) {
    var overlay = document.getElementById('airLoadingOverlay');
    var resultContainer = document.getElementById('airResultContainer');
    if (overlay && overlay.classList.contains('active') && resultContainer && resultContainer.classList.contains('reveal')) {
      if (e.target === overlay) {
        overlay.classList.add('fade-out');
        setTimeout(function() {
          overlay.style.display = 'none';
          overlay.classList.remove('active', 'fade-out');
          document.body.style.overflow = '';
        }, 400);
      }
    }
  });
})();
</script>
<!-- END AIR LOADING OVERLAY -->`;

  content = content.replace('</body>', loadingCode + '\n</body>');

  // 3. Update triggerPrediction to use the new loading system
  var oldTrigger = `window.triggerPrediction = function() {
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
          };`;

  var newTrigger = `window.triggerPrediction = function() {
            const score = parseInt(slider.value, 10);
            const { predictedRank, minRank, maxRank } = predictRank(score);

            // Use the premium cinematic loading & reveal system
            if (window.showAIRLoadingAndReveal) {
              window.showAIRLoadingAndReveal(minRank, maxRank, score);
            }
          };`;

  if (content.includes(oldTrigger)) {
    content = content.replace(oldTrigger, newTrigger);
    console.log('Updated triggerPrediction to use cinematic loading.');
  } else {
    console.log('WARNING: Could not find triggerPrediction to replace. Trying partial...');
    // Try finding just the function signature
    var sigIdx = content.indexOf('window.triggerPrediction = function()');
    var endIdx = content.indexOf('};', sigIdx);
    if (sigIdx !== -1 && endIdx !== -1) {
      content = content.substring(0, sigIdx) + newTrigger + content.substring(endIdx + 2);
      console.log('Updated via partial match.');
    }
  }

  fs.writeFileSync(indexPath, content, 'utf8');
  console.log('Successfully injected premium AIR loading & reveal system!');
} catch (error) {
  console.error('Error:', error);
}
