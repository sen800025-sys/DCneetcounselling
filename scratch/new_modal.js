  function showLimitReachedPopup() {
    let popup = document.getElementById('pmLimitReachedModal');
    if (!popup) {
      popup = document.createElement('div');
      popup.id = 'pmLimitReachedModal';
      document.body.appendChild(popup);
    }
    
    popup.innerHTML = \
      <style>
        #pmLimitReachedModal {
          position: fixed;
          top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(11, 0, 20, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 10000005;
          display: none;
          align-items: flex-start;
          justify-content: center;
          padding: 40px 16px;
          overflow-y: auto;
          box-sizing: border-box;
          opacity: 0;
          transition: opacity 300ms ease;
        }
        #pmLimitReachedModal.active { display: flex; opacity: 1; }
        
        .pm-upgrade-offer-card {
          background: linear-gradient(135deg, #1c0035 0%, #0d001a 100%);
          border: 1.5px solid rgba(255, 195, 0, 0.2);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(123, 47, 247, 0.25);
          font-family: 'Poppins', sans-serif;
          position: relative;
          text-align: center;
          width: 100%;
          max-width: 480px;
          margin: auto 0;
          border-radius: 24px;
          padding: 32px 24px;
          transform: scale(0.95);
          opacity: 0;
          transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 300ms ease;
        }
        #pmLimitReachedModal.active .pm-upgrade-offer-card { transform: scale(1); opacity: 1; }
        
        .pm-upgrade-close-btn {
          position: absolute; top: 16px; right: 16px;
          width: 36px; height: 36px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 50%; color: rgba(255, 255, 255, 0.6);
          font-size: 20px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        
        .pm-upgrade-title {
          color: #fff; font-size: 24px; font-weight: 800; margin: 0 0 12px 0;
        }
        
        .pm-upgrade-description {
          color: rgba(255, 255, 255, 0.7); font-size: 14px; margin-bottom: 24px; line-height: 1.5;
        }
        
        .pm-plans-container {
          display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;
        }
        
        .pm-plan-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 20px;
          text-align: left;
          position: relative;
        }
        .pm-plan-card.featured {
          background: rgba(255, 195, 0, 0.06);
          border: 1px solid rgba(255, 195, 0, 0.4);
        }
        .pm-plan-badge {
          position: absolute; top: -12px; right: 20px;
          background: linear-gradient(90deg, #FFD54F, #FFC107);
          color: #1A0033; font-size: 12px; font-weight: 700;
          padding: 4px 12px; border-radius: 20px;
          box-shadow: 0 4px 10px rgba(255, 193, 7, 0.3);
        }
        
        .pm-plan-header {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
        }
        .pm-plan-name { color: #fff; font-size: 18px; font-weight: 700; }
        .pm-plan-price { color: #FFC300; font-size: 24px; font-weight: 800; }
        
        .pm-plan-features {
          display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;
        }
        .pm-plan-feature {
          color: rgba(255, 255, 255, 0.85); font-size: 13.5px;
          display: flex; align-items: flex-start; gap: 8px; line-height: 1.4;
        }
        .pm-plan-feature i { color: #4CAF50; font-size: 14px; margin-top: 2px; }
        
        .pm-plan-btn {
          width: 100%; height: 48px; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; border: none;
        }
        .pm-plan-btn-primary {
          background: linear-gradient(90deg, #FFD54F, #FFC107); color: #1A0033;
        }
        .pm-plan-btn-secondary {
          background: rgba(255, 255, 255, 0.1); color: #fff;
        }
        
        .pm-skip-btn {
          background: none; border: none; color: rgba(255, 255, 255, 0.5); font-size: 14px;
          cursor: pointer; margin-top: 8px; text-decoration: underline;
        }
      </style>
      
      <div class="pm-upgrade-offer-card">
        <button class="pm-upgrade-close-btn" onclick="window.closePmLimitReachedModal()">&times;</button>
        
        <h2 class="pm-upgrade-title">?? Upgrade Your Experience</h2>
        <p class="pm-upgrade-description">
          You have reached the free limit. Choose a plan below to continue creating and downloading your preference lists!
        </p>
        
        <div class="pm-plans-container">
          <!-- ?99 Plan -->
          <div class="pm-plan-card">
            <div class="pm-plan-header">
              <div class="pm-plan-name">Basic Extension</div>
              <div class="pm-plan-price">?99</div>
            </div>
            <div class="pm-plan-features">
              <div class="pm-plan-feature"><i class="fas fa-check-circle"></i> 3 Additional Preference Lists</div>
              <div class="pm-plan-feature"><i class="fas fa-check-circle"></i> Up to 3 PDF Downloads</div>
              <div class="pm-plan-feature"><i class="fas fa-check-circle"></i> Unlimited College Additions</div>
            </div>
            <button class="pm-plan-btn pm-plan-btn-secondary" onclick="window.confirmPmUpgradeOffer(99.00)">
              Unlock Basic • ?99
            </button>
          </div>
          
          <!-- ?199 Plan -->
          <div class="pm-plan-card featured">
            <div class="pm-plan-badge">BEST VALUE</div>
            <div class="pm-plan-header">
              <div class="pm-plan-name">Unlimited Access</div>
              <div class="pm-plan-price">?199</div>
            </div>
            <div class="pm-plan-features">
              <div class="pm-plan-feature"><i class="fas fa-check-circle"></i> Unlimited Preference Lists</div>
              <div class="pm-plan-feature"><i class="fas fa-check-circle"></i> Unlimited PDF Downloads</div>
              <div class="pm-plan-feature"><i class="fas fa-check-circle"></i> Save Lists Permanently</div>
              <div class="pm-plan-feature"><i class="fas fa-check-circle"></i> Priority Support</div>
            </div>
            <button class="pm-plan-btn pm-plan-btn-primary" onclick="window.confirmPmUpgradeOffer(199.00)">
              Unlock Unlimited • ?199
            </button>
          </div>
        </div>
        
        <button class="pm-skip-btn" onclick="window.closePmLimitReachedModal()">Maybe Later</button>
      </div>
    \;

    // Window helper functions for event triggers
    window.closePmLimitReachedModal = function() {
      popup.classList.remove("active");
      setTimeout(() => {
        popup.style.display = "none";
      }, 300);
    };

    window.confirmPmUpgradeOffer = function(amount) {
      window.closePmLimitReachedModal();
      window.pmInitiatePremiumUpgrade(amount || 99.00);
    };

    // Close on overlay click
    popup.onclick = function(e) {
      if (e.target === popup) {
        window.closePmLimitReachedModal();
      }
    };

    // Pre-warm the Supabase Edge Function to eliminate cold starts
    try {
      const backendUrl = "https://rlqmdylbzapyepuwncwt.supabase.co/functions/v1";
      fetch(\\/razorpay-payment\, {
        method: "OPTIONS"
      }).catch(() => {});
    } catch (_) {}

    // Display overlay
    popup.style.display = "flex";
    setTimeout(() => {
      popup.classList.add("active");
    }, 10);
  }
