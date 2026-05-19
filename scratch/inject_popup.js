const fs = require('fs');
const indexPath = 'c:\\Users\\rushi\\Downloads\\DCneetcounselling\\frontend\\web\\index.html';

try {
  let content = fs.readFileSync(indexPath, 'utf8');

  // 1. Check if popup already exists
  if (content.includes('id="predictorLeadPopup"')) {
    console.log('Popup already exists. Removing old version first...');
    // Remove old popup
    const oldStart = content.indexOf('<!-- PREDICTOR LEAD POPUP -->');
    const oldEnd = content.indexOf('<!-- END PREDICTOR LEAD POPUP -->');
    if (oldStart !== -1 && oldEnd !== -1) {
      content = content.substring(0, oldStart) + content.substring(oldEnd + 34);
    }
  }

  // 2. Insert popup HTML+CSS+JS right before </body>
  const popupCode = `<!-- PREDICTOR LEAD POPUP -->
<style>
  /* ═══════════════════════════════════════════════════════════
     PREDICTOR LEAD POPUP - Premium Glassmorphism Modal
  ═══════════════════════════════════════════════════════════ */
  .plp-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.72);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    z-index: 99999;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 20px;
    opacity: 0;
    transition: opacity 0.35s ease;
  }
  .plp-overlay.active {
    display: flex;
    opacity: 1;
  }
  .plp-overlay.closing {
    opacity: 0;
  }

  .plp-modal {
    width: 100%;
    max-width: 480px;
    max-height: 92vh;
    overflow-y: auto;
    background: linear-gradient(180deg, rgba(42,0,82,0.96) 0%, rgba(24,0,45,0.96) 100%);
    border: 1px solid rgba(255,210,51,0.22);
    box-shadow: 0 0 80px rgba(176,38,255,0.28);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border-radius: 30px;
    padding: 36px 28px 28px;
    position: relative;
    transform: scale(0.92);
    opacity: 0;
    transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .plp-modal::-webkit-scrollbar { display: none; }
  .plp-overlay.active .plp-modal {
    transform: scale(1);
    opacity: 1;
  }
  .plp-overlay.closing .plp-modal {
    transform: scale(0.92);
    opacity: 0;
  }

  /* Gradient border overlay */
  .plp-modal::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 30px;
    padding: 1.5px;
    background: linear-gradient(135deg, rgba(255,210,51,0.45), rgba(176,38,255,0.45));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  /* Close Button */
  .plp-close {
    position: absolute;
    top: 16px; right: 16px;
    width: 36px; height: 36px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 50%;
    color: rgba(255,255,255,0.7);
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.25s ease;
    z-index: 2;
  }
  .plp-close:hover {
    background: rgba(176,38,255,0.3);
    border-color: #B026FF;
    color: #fff;
    box-shadow: 0 0 18px rgba(176,38,255,0.5);
  }

  /* Heading */
  .plp-heading {
    text-align: center;
    font-size: 24px;
    font-weight: 800;
    background: linear-gradient(90deg, #FFFFFF 0%, #FFD233 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0 0 8px;
    line-height: 1.3;
    text-shadow: none;
  }
  .plp-subtitle {
    text-align: center;
    font-size: 14px;
    color: rgba(255,255,255,0.72);
    margin: 0 0 24px;
    line-height: 1.5;
  }

  /* Form */
  .plp-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  /* Input Group */
  .plp-input-group {
    position: relative;
  }
  .plp-input-group label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.55);
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .plp-input {
    width: 100%;
    height: 56px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 18px;
    color: #FFFFFF;
    font-size: 16px;
    font-family: 'Poppins', sans-serif;
    padding: 0 18px;
    outline: none;
    transition: all 0.3s ease;
    box-sizing: border-box;
    -webkit-appearance: none;
  }
  .plp-input::placeholder {
    color: rgba(255,255,255,0.42);
  }
  .plp-input:focus {
    border-color: #B026FF;
    box-shadow: 0 0 18px rgba(176,38,255,0.45);
    background: rgba(255,255,255,0.06);
  }

  /* State Dropdown */
  .plp-select-wrap {
    position: relative;
  }
  .plp-select-wrap::after {
    content: "▾";
    position: absolute;
    right: 18px;
    bottom: 18px;
    color: rgba(255,255,255,0.4);
    pointer-events: none;
    font-size: 14px;
  }
  .plp-select {
    width: 100%;
    height: 56px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 18px;
    color: #FFFFFF;
    font-size: 16px;
    font-family: 'Poppins', sans-serif;
    padding: 0 40px 0 18px;
    outline: none;
    transition: all 0.3s ease;
    box-sizing: border-box;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    cursor: pointer;
  }
  .plp-select:focus {
    border-color: #B026FF;
    box-shadow: 0 0 18px rgba(176,38,255,0.45);
    background: rgba(255,255,255,0.06);
  }
  .plp-select option {
    background: #1B0033;
    color: #fff;
    padding: 10px;
  }

  /* Category Segmented */
  .plp-category-wrap label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.55);
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .plp-category-btns {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .plp-cat-btn {
    flex: 1;
    min-width: 58px;
    height: 44px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px;
    color: rgba(255,255,255,0.65);
    font-size: 13px;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    cursor: pointer;
    transition: all 0.25s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .plp-cat-btn:hover {
    background: rgba(176,38,255,0.15);
    border-color: rgba(176,38,255,0.4);
    color: #fff;
  }
  .plp-cat-btn.active {
    background: linear-gradient(90deg, #FFD233, #B026FF);
    border-color: transparent;
    color: #1A0030;
    font-weight: 700;
    box-shadow: 0 0 20px rgba(255,210,51,0.3);
  }

  /* Mobile Field */
  .plp-mobile-wrap {
    display: flex;
    align-items: stretch;
    gap: 0;
  }
  .plp-mobile-prefix {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    border-right: none;
    border-radius: 18px 0 0 18px;
    padding: 0 14px;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255,255,255,0.7);
    flex-shrink: 0;
    white-space: nowrap;
  }
  .plp-mobile-prefix .plp-flag {
    font-size: 18px;
  }
  .plp-mobile-input {
    flex: 1;
    height: 56px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-left: none;
    border-radius: 0 18px 18px 0;
    color: #FFFFFF;
    font-size: 16px;
    font-family: 'Poppins', sans-serif;
    padding: 0 18px;
    outline: none;
    transition: all 0.3s ease;
    box-sizing: border-box;
    -webkit-appearance: none;
    letter-spacing: 1px;
  }
  .plp-mobile-input::placeholder {
    color: rgba(255,255,255,0.42);
    letter-spacing: 0;
  }
  .plp-mobile-wrap:focus-within .plp-mobile-prefix,
  .plp-mobile-wrap:focus-within .plp-mobile-input {
    border-color: #B026FF;
    box-shadow: 0 0 18px rgba(176,38,255,0.45);
    background: rgba(255,255,255,0.06);
  }

  /* Error */
  .plp-error {
    color: #ff6b6b;
    font-size: 12px;
    margin-top: 4px;
    display: none;
  }
  .plp-error.show {
    display: block;
  }

  /* Submit Button */
  .plp-submit {
    width: 100%;
    height: 62px;
    border-radius: 22px;
    background: linear-gradient(90deg, #FFD233 0%, #FFC83D 20%, #E47CFF 58%, #B026FF 100%);
    color: #1A0030;
    font-size: 18px;
    font-weight: 800;
    font-family: 'Poppins', sans-serif;
    border: none;
    cursor: pointer;
    box-shadow: 0 0 35px rgba(255,210,51,0.35);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 6px;
  }
  .plp-submit:hover {
    transform: scale(1.02);
    box-shadow: 0 0 50px rgba(255,210,51,0.5);
    background: linear-gradient(90deg, #FFE066 0%, #FFD233 20%, #F29CFF 58%, #C145FF 100%);
  }
  .plp-submit:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  /* Trust Row */
  .plp-trust {
    display: flex;
    justify-content: center;
    gap: 18px;
    flex-wrap: wrap;
    margin-top: 16px;
  }
  .plp-trust-item {
    font-size: 11px;
    color: rgba(255,255,255,0.55);
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }
  .plp-trust-check {
    color: #FFD233;
    font-size: 13px;
  }

  /* ═══ Mobile Responsive ═══ */
  @media (max-width: 768px) {
    .plp-overlay {
      padding: 12px;
      align-items: flex-start;
      padding-top: 5vh;
    }
    .plp-modal {
      width: 92%;
      max-width: none;
      padding: 28px 20px 22px;
      border-radius: 24px;
      max-height: 88vh;
    }
    .plp-heading {
      font-size: 20px;
    }
    .plp-subtitle {
      font-size: 13px;
      margin-bottom: 18px;
    }
    .plp-form {
      gap: 14px;
    }
    .plp-input, .plp-select, .plp-mobile-input {
      height: 50px;
      font-size: 15px;
      border-radius: 14px;
    }
    .plp-mobile-prefix {
      border-radius: 14px 0 0 14px;
      padding: 0 10px;
      font-size: 13px;
    }
    .plp-mobile-input {
      border-radius: 0 14px 14px 0;
    }
    .plp-select {
      border-radius: 14px;
    }
    .plp-cat-btn {
      height: 40px;
      font-size: 12px;
      border-radius: 12px;
    }
    .plp-submit {
      height: 54px;
      font-size: 16px;
      border-radius: 16px;
    }
    .plp-trust {
      gap: 12px;
    }
    .plp-trust-item {
      font-size: 10px;
    }
    .plp-close {
      width: 32px;
      height: 32px;
      font-size: 16px;
      top: 12px;
      right: 12px;
    }
  }
</style>

<!-- Popup HTML -->
<div class="plp-overlay" id="predictorLeadPopup">
  <div class="plp-modal">
    <button class="plp-close" id="plpCloseBtn" aria-label="Close">&times;</button>

    <h2 class="plp-heading">Get Your Final AIR Prediction</h2>
    <p class="plp-subtitle">Fill your details to unlock your predicted NEET AIR range instantly.</p>

    <form class="plp-form" id="plpForm" autocomplete="off" novalidate>
      <!-- Full Name -->
      <div class="plp-input-group">
        <label>Full Name</label>
        <input type="text" class="plp-input" id="plpName" placeholder="Enter your full name" required>
        <div class="plp-error" id="plpNameErr">Please enter your name</div>
      </div>

      <!-- State -->
      <div class="plp-input-group plp-select-wrap">
        <label>State</label>
        <select class="plp-select" id="plpState" required>
          <option value="" disabled selected>Select your state</option>
          <option value="Andhra Pradesh">Andhra Pradesh</option>
          <option value="Arunachal Pradesh">Arunachal Pradesh</option>
          <option value="Assam">Assam</option>
          <option value="Bihar">Bihar</option>
          <option value="Chhattisgarh">Chhattisgarh</option>
          <option value="Delhi">Delhi</option>
          <option value="Goa">Goa</option>
          <option value="Gujarat">Gujarat</option>
          <option value="Haryana">Haryana</option>
          <option value="Himachal Pradesh">Himachal Pradesh</option>
          <option value="Jharkhand">Jharkhand</option>
          <option value="Karnataka">Karnataka</option>
          <option value="Kerala">Kerala</option>
          <option value="Madhya Pradesh">Madhya Pradesh</option>
          <option value="Maharashtra">Maharashtra</option>
          <option value="Manipur">Manipur</option>
          <option value="Meghalaya">Meghalaya</option>
          <option value="Mizoram">Mizoram</option>
          <option value="Nagaland">Nagaland</option>
          <option value="Odisha">Odisha</option>
          <option value="Punjab">Punjab</option>
          <option value="Rajasthan">Rajasthan</option>
          <option value="Sikkim">Sikkim</option>
          <option value="Tamil Nadu">Tamil Nadu</option>
          <option value="Telangana">Telangana</option>
          <option value="Tripura">Tripura</option>
          <option value="Uttar Pradesh">Uttar Pradesh</option>
          <option value="Uttarakhand">Uttarakhand</option>
          <option value="West Bengal">West Bengal</option>
          <option value="Andaman & Nicobar">Andaman & Nicobar</option>
          <option value="Chandigarh">Chandigarh</option>
          <option value="Dadra & Nagar Haveli">Dadra & Nagar Haveli</option>
          <option value="Jammu & Kashmir">Jammu & Kashmir</option>
          <option value="Ladakh">Ladakh</option>
          <option value="Lakshadweep">Lakshadweep</option>
          <option value="Puducherry">Puducherry</option>
        </select>
        <div class="plp-error" id="plpStateErr">Please select your state</div>
      </div>

      <!-- Category -->
      <div class="plp-input-group plp-category-wrap">
        <label>Category</label>
        <div class="plp-category-btns" id="plpCategoryBtns">
          <button type="button" class="plp-cat-btn active" data-cat="General">General</button>
          <button type="button" class="plp-cat-btn" data-cat="OBC">OBC</button>
          <button type="button" class="plp-cat-btn" data-cat="EWS">EWS</button>
          <button type="button" class="plp-cat-btn" data-cat="SC">SC</button>
          <button type="button" class="plp-cat-btn" data-cat="ST">ST</button>
        </div>
        <input type="hidden" id="plpCategory" value="General">
      </div>

      <!-- Mobile Number -->
      <div class="plp-input-group">
        <label>Mobile Number</label>
        <div class="plp-mobile-wrap">
          <div class="plp-mobile-prefix">
            <span class="plp-flag">🇮🇳</span> +91
          </div>
          <input type="tel" class="plp-mobile-input" id="plpMobile" placeholder="Enter 10-digit number" maxlength="10" pattern="[0-9]{10}" inputmode="numeric" required>
        </div>
        <div class="plp-error" id="plpMobileErr">Please enter a valid 10-digit number</div>
      </div>

      <!-- Submit -->
      <button type="submit" class="plp-submit" id="plpSubmitBtn">
        <i class="fas fa-unlock"></i> UNLOCK MY PREDICTION
      </button>
    </form>

    <div class="plp-trust">
      <span class="plp-trust-item"><span class="plp-trust-check">✓</span> Instant Prediction</span>
      <span class="plp-trust-item"><span class="plp-trust-check">✓</span> Secure Details</span>
      <span class="plp-trust-item"><span class="plp-trust-check">✓</span> Latest Trend Analysis</span>
    </div>
  </div>
</div>

<script>
(function() {
  // ═══ Popup Controller ═══
  const overlay = document.getElementById('predictorLeadPopup');
  const closeBtn = document.getElementById('plpCloseBtn');
  const form = document.getElementById('plpForm');
  const submitBtn = document.getElementById('plpSubmitBtn');
  const catBtns = document.querySelectorAll('.plp-cat-btn');
  const mobileInput = document.getElementById('plpMobile');

  // Category selector
  catBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      catBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      document.getElementById('plpCategory').value = btn.getAttribute('data-cat');
    });
  });

  // Mobile number: digits only
  mobileInput.addEventListener('input', function() {
    this.value = this.value.replace(/[^0-9]/g, '').substring(0, 10);
  });

  // Open popup (called from predict button)
  window.openPredictorLeadPopup = function() {
    overlay.style.display = 'flex';
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        overlay.classList.add('active');
        overlay.classList.remove('closing');
      });
    });
    document.body.style.overflow = 'hidden';
  };

  // Close popup
  function closePopup() {
    overlay.classList.add('closing');
    overlay.classList.remove('active');
    setTimeout(function() {
      overlay.style.display = 'none';
      overlay.classList.remove('closing');
      document.body.style.overflow = '';
    }, 350);
  }

  closeBtn.addEventListener('click', closePopup);
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closePopup();
  });

  // Validation
  function validateForm() {
    let valid = true;
    const name = document.getElementById('plpName');
    const state = document.getElementById('plpState');
    const mobile = document.getElementById('plpMobile');
    const nameErr = document.getElementById('plpNameErr');
    const stateErr = document.getElementById('plpStateErr');
    const mobileErr = document.getElementById('plpMobileErr');

    nameErr.classList.remove('show');
    stateErr.classList.remove('show');
    mobileErr.classList.remove('show');

    if (!name.value.trim()) {
      nameErr.classList.add('show');
      valid = false;
    }
    if (!state.value) {
      stateErr.classList.add('show');
      valid = false;
    }
    if (!mobile.value || mobile.value.length !== 10) {
      mobileErr.classList.add('show');
      valid = false;
    }
    return valid;
  }

  // Loading texts
  const loadingTexts = [
    "Analyzing NEET trends...",
    "Calculating AIR range...",
    "Comparing previous year data...",
    "Generating prediction..."
  ];

  // Form submit
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!validateForm()) return;

    // Collect data
    const leadData = {
      name: document.getElementById('plpName').value.trim(),
      state: document.getElementById('plpState').value,
      category: document.getElementById('plpCategory').value,
      mobile: document.getElementById('plpMobile').value,
      score: document.getElementById('predictorScoreSlider').value,
      timestamp: new Date().toISOString()
    };

    console.log('Lead captured:', leadData);

    // Save to localStorage as backup
    try {
      const leads = JSON.parse(localStorage.getItem('predictor_leads') || '[]');
      leads.push(leadData);
      localStorage.setItem('predictor_leads', JSON.stringify(leads));
    } catch(err) {}

    // Show loading on button
    submitBtn.disabled = true;
    let loadIdx = 0;
    const originalBtnText = submitBtn.innerHTML;

    function showNextLoading() {
      if (loadIdx < loadingTexts.length) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + loadingTexts[loadIdx];
        loadIdx++;
        setTimeout(showNextLoading, 500);
      } else {
        // Done - close popup and show results
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        closePopup();

        // Trigger the actual prediction
        setTimeout(function() {
          if (window.triggerPrediction) {
            window.triggerPrediction();
          }
        }, 400);
      }
    }
    showNextLoading();
  });
})();
</script>
<!-- END PREDICTOR LEAD POPUP -->`;

  // Insert before </body>
  content = content.replace('</body>', popupCode + '\n</body>');

  // 3. Now modify the predict button click handler
  // We need to change the predictBtn click to open popup instead of predicting directly
  // Find the old predictBtn click handler and replace it
  const oldHandler = `predictBtn.addEventListener('click', function() {`;
  const newHandler = `// Expose the actual prediction trigger for the popup
          window.triggerPrediction = function() {`;
  
  content = content.replace(oldHandler, newHandler);

  // Add new click handler that opens popup instead
  const sliderUpdateCall = `updateSliderBackground();

          predictBtn.addEventListener`;
  
  if (content.includes(sliderUpdateCall)) {
    content = content.replace(sliderUpdateCall, `updateSliderBackground();

          // Open lead popup when predict button is clicked
          predictBtn.addEventListener('click', function() {
            if (window.openPredictorLeadPopup) {
              window.openPredictorLeadPopup();
            }
          });

          predictBtn.addEventListener`);
  } else {
    // Alternative: just add the popup opener before the triggerPrediction function
    const altTarget = `updateSliderBackground();\n\n          // Expose`;
    if (content.includes(altTarget)) {
      content = content.replace(altTarget, `updateSliderBackground();

          // Open lead popup when predict button is clicked
          predictBtn.addEventListener('click', function() {
            if (window.openPredictorLeadPopup) {
              window.openPredictorLeadPopup();
            }
          });

          // Expose`);
    }
  }

  // Remove the old direct click handler on predictBtn if it still exists separately
  // The old one started with predictBtn.addEventListener('click', function() { and called predict directly
  
  fs.writeFileSync(indexPath, content, 'utf8');
  console.log('Successfully injected premium lead popup!');
} catch (error) {
  console.error('Error:', error);
}
