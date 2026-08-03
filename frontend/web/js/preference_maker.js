/**
  NEET Preference Maker - Core Logic & Interactive Features
*/

(function() {
  // Known premium colleges from specifications to maintain pixel-perfect matching
  const KNOWN_COLLEGES = {
    "aiims new delhi": { fees: 1628, bond: "1 Year Rural Service | Penalty: 15 Lakhs" },
    "all india institute of medical sciences delhi": { fees: 1628, bond: "1 Year Rural Service | Penalty: 15 Lakhs" },
    "maulana azad": { fees: 4779, bond: "1 Year Rural Service | Penalty: 15 Lakhs" },
    "lady hardinge": { fees: 4779, bond: "1 Year Rural Service | Penalty: 15 Lakhs" },
    "jipmer": { fees: 6200, bond: "Penalty: 4 Lakhs" },
    "christian medical college": { fees: 25000, bond: "5 Years Rural Service | Penalty: 5 Lakhs" },
    "stanley medical college": { fees: 18073, bond: "5 Years Rural Service | Penalty: 5 Lakhs" },
    "armed forces medical college": { fees: 9400, bond: "1 Year Rural Service | Penalty: 10 Lakhs" },
    "bj medical college": { fees: 25000, bond: "1 Year Rural Service | Penalty: 20 Lakhs" },
    "kmc manipal": { fees: 21000, bond: "1 Year Rural Service" },
    "king george": { fees: 12000, bond: "2 Years Rural Service | Penalty: 10 Lakhs" }
  };

  // Global State
  const state = {
    allColleges: [],
    preferences: [],
    viewMode: "all", // "all" or "preferences"
    dbLoaded: false,
    isLoading: false,
    filters: {
      search: "",
      state: "All",
      course: "All",
      maxFees: ""
    },
    editingId: null,
    userMobile: null,
    planType: "free",
    attemptsUsed: 0,
    maxAttempts: 1,
    listsRemaining: 0,
    paymentStatus: "unpaid",
    lists: [],
    activeListId: null,
    userDetails: null,
    pendingAction: null,
    userDataPromise: null,
    userDataPromiseUserId: null
  };

  // Helper to save user details cache to local storage
  function saveUserDetailsToCache() {
    try {
      if (state.userMobile && state.userDetails && window._authUser) {
        localStorage.setItem('pm_user_details', JSON.stringify({
          userId: window._authUser.id,
          mobile: state.userMobile,
          userDetails: state.userDetails
        }));
      }
    } catch (e) {
      console.error("Failed to save user details to cache:", e);
    }
  }

  // Helper to check if user details and mobile are filled
  function isDetailsFilled() {
    return !!(state.userMobile && 
              state.userDetails && 
              state.userDetails.name && 
              state.userDetails.name !== 'Student' && 
              state.userDetails.name.trim() !== '');
  }

  // Helper to format fees in Indian Rupees format (e.g. 1,628)
  function formatFees(val) {
    if (!val || Number(val) === 0) return '-';
    return Number(val).toLocaleString('en-IN');
  }

  // Helper to format bond details into structured HTML for mobile view
  function formatBondDetails(bondStr) {
    if (!bondStr || bondStr === 'N/A' || bondStr.trim().toLowerCase() === 'no bond' || bondStr.trim().toLowerCase() === 'no service bond') {
      return `<div class="pm-bond-service pm-bond-nobond">📝 No Bond</div>`;
    }

    const parts = bondStr.split(/[|;\n]+/).map(p => p.trim()).filter(Boolean);
    let html = '';
    let serviceText = '';
    let penaltyText = '';
    let discontinueText = '';

    for (const part of parts) {
      const partLower = part.toLowerCase();
      if (partLower.includes('service') || partLower.includes('rural') || partLower.includes('years') || partLower.includes('year') || partLower.includes('bond')) {
        if (!partLower.includes('penalty') && !partLower.includes('discontinue')) {
          serviceText = part;
        }
      }
      
      if (partLower.includes('penalty')) {
        let val = part.replace(/penalty:?/i, '').trim();
        if (!val.startsWith('₹') && !val.startsWith('Rs.')) {
          val = '₹' + val;
        }
        penaltyText = `Penalty: ${val}`;
      } else if (partLower.includes('discontinue')) {
        let val = part.replace(/discontinue:?/i, '').trim();
        if (!val.startsWith('₹') && !val.startsWith('Rs.')) {
          val = '₹' + val;
        }
        discontinueText = `Discontinue: ${val}`;
      }
    }

    if (!serviceText && parts[0] && !parts[0].toLowerCase().includes('penalty') && !parts[0].toLowerCase().includes('discontinue')) {
      serviceText = parts[0];
    }

    if (serviceText) {
      html += `<div class="pm-bond-service">📝 ${serviceText}</div>`;
    } else if (bondStr && !penaltyText && !discontinueText) {
      html += `<div class="pm-bond-service">📝 ${bondStr}</div>`;
    }

    if (penaltyText || discontinueText) {
      html += `<div class="pm-bond-penalties">`;
      if (penaltyText) {
        html += `<div class="pm-bond-penalty-item">${penaltyText}</div>`;
      }
      if (discontinueText) {
        html += `<div class="pm-bond-penalty-item">${discontinueText}</div>`;
      }
      html += `</div>`;
    }

    return html;
  }

  // Helper to check attempts left for email
  async function checkEmailAttempts(email) {
    const statusDiv = document.getElementById("pmAttemptsStatus");
    const submitBtn = document.querySelector('#pmDownloadForm button[type="submit"]');
    if (!statusDiv || !submitBtn) return;

    statusDiv.style.display = "block";
    statusDiv.style.color = "var(--pm-text-secondary)";
    statusDiv.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Checking attempts...`;

    try {
      if (!window.supabaseClient) {
        statusDiv.style.display = "none";
        return;
      }

      const { data: user, error } = await window.supabaseClient
        .from('preference_maker_users')
        .select('attempts_used, is_unlimited, max_attempts')
        .eq('email', email)
        .maybeSingle();

      if (error) throw error;

      if (!user) {
        statusDiv.style.color = "#22c55e";
        statusDiv.innerHTML = `<i class="fas fa-check-circle"></i> Attempts Remaining: 1 / 1`;
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
        submitBtn.style.cursor = "pointer";
      } else {
        if (user.is_unlimited) {
          statusDiv.style.color = "#22c55e";
          statusDiv.innerHTML = `<i class="fas fa-infinity"></i> Attempts Remaining: Unlimited`;
          submitBtn.disabled = false;
          submitBtn.style.opacity = "1";
          submitBtn.style.cursor = "pointer";
        } else {
          const maxAtt = user.max_attempts != null ? user.max_attempts : 1;
          const remaining = Math.max(0, maxAtt - user.attempts_used);
          if (remaining === 0) {
            statusDiv.style.color = "#ef4444";
            statusDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> Attempts Remaining: 0 / ${maxAtt} (Limit Reached)`;
            submitBtn.disabled = true;
            submitBtn.style.opacity = "0.5";
            submitBtn.style.cursor = "not-allowed";
          } else if (remaining === 1) {
            statusDiv.style.color = "#ffc300";
            statusDiv.innerHTML = `<span class="pm-attempts-warn-badge" style="background: rgba(255, 195, 0, 0.15); color: #FFC300; padding: 2px 6px; border-radius: 4px; display: inline-block;"><i class="fas fa-exclamation-triangle"></i> Attempts Remaining: 1 / ${maxAtt} (Last attempt!)</span>`;
            submitBtn.disabled = false;
            submitBtn.style.opacity = "1";
            submitBtn.style.cursor = "pointer";
          } else {
            statusDiv.style.color = "#22c55e";
            statusDiv.innerHTML = `<i class="fas fa-check-circle"></i> Attempts Remaining: ${remaining} / ${maxAtt}`;
            submitBtn.disabled = false;
            submitBtn.style.opacity = "1";
            submitBtn.style.cursor = "pointer";
          }
        }
      }
    } catch (err) {
      console.error("Error checking email attempts:", err);
      statusDiv.style.color = "#ef4444";
      statusDiv.innerHTML = `⚠️ Failed to check attempts status.`;
    }
  }

  // Trigger premium upgrade Razorpay checkout
  window.pmInitiatePremiumUpgrade = async function(customAmount) {
    if (!state.userMobile || !window.supabaseClient || !window._authUser) {
      alert("Billing details unavailable. Make sure you are logged in with mobile number saved.");
      return;
    }

    const upgradeBtn = document.querySelector('#pmUpgradeModal .pm-btn-yellow') || document.querySelector('.pm-upgrade-btn-primary');
    const originalText = upgradeBtn ? (upgradeBtn.tagName === 'BUTTON' ? upgradeBtn.innerText : upgradeBtn.textContent) : "Upgrade Now";
    if (upgradeBtn) {
      upgradeBtn.disabled = true;
      if (upgradeBtn.tagName === 'BUTTON') {
        upgradeBtn.innerText = "Initiating Payment...";
      } else {
        upgradeBtn.textContent = "Initiating Payment...";
      }
    }

    const isMobile = window.innerWidth <= 768;
    const payAmount = customAmount !== undefined ? customAmount : (isMobile ? 1.00 : 99.00);

    try {
      const backendUrl = "https://rlqmdylbzapyepuwncwt.supabase.co/functions/v1";
      const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscW1keWxiemFweWVwdXduY3d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNTcwNzYsImV4cCI6MjA5MTgzMzA3Nn0.oNNK1pwLnykQlNfUkw7IdB-ZBkKDoWxszsKDSIjsLeo";
      const sessionData = await window.supabaseClient.auth.getSession();
      const session = sessionData?.data?.session;

      const createRes = await fetch(`${backendUrl}/razorpay-payment`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "apikey": anonKey,
          "Authorization": session?.access_token ? `Bearer ${session.access_token}` : `Bearer ${anonKey}`
        },
        body: JSON.stringify({
          email: window._authUser.email,
          full_name: window._authUser.user_metadata?.full_name || window._authUser.user_metadata?.name || 'Student',
          mobile: state.userMobile,
          product_name: "Premium Preference Maker",
          amount: payAmount,
          coupon: null,
          user_id: window._authUser.id,
          wallet_enabled: false,
          counselling_type: "preference_maker"
        })
      });

      if (!createRes.ok) {
        let errMsg = `Status ${createRes.status}`;
        try {
          const errData = await createRes.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }
      const order = await createRes.json();
      if (!order.success) throw new Error(order.error || "Failed to create order");

      var options = {
        "key": order.key_id,
        "amount": Math.round(order.final_amount * 100),
        "currency": "INR",
        "name": "DC Neet Counselling",
        "description": "Premium Preference Maker Upgrade",
        "order_id": order.razorpay_order_id,
        "handler": async function (response) {
          try {
            if (upgradeBtn) {
              if (upgradeBtn.tagName === 'BUTTON') {
                upgradeBtn.innerText = "Verifying Payment...";
              } else {
                upgradeBtn.textContent = "Verifying Payment...";
              }
            }
            
            const responseVerify = await fetch(`${backendUrl}/verify-payment`, {
              method: "POST",
              headers: { 
                "Content-Type": "application/json", 
                "Authorization": session?.access_token ? `Bearer ${session.access_token}` : `Bearer ${anonKey}` 
              },
              body: JSON.stringify({ 
                order_id: order.order_id, 
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                is_wallet_only: false 
              })
            });
            const dataVerify = await responseVerify.json();
            if (dataVerify.success) {
              alert("Congratulations! Upgrade successful. You are now a Premium User.");
              const upgradeModal = document.getElementById('pmUpgradeModal');
              if (upgradeModal) upgradeModal.style.display = 'none';
              const limitReachedModal = document.getElementById('pmLimitReachedModal');
              if (limitReachedModal) {
                limitReachedModal.classList.remove('active');
                setTimeout(() => { limitReachedModal.style.display = 'none'; }, 300);
              }
              await loadUserPreferenceMakerData();
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (err) {
            console.error(err);
            alert("Payment verification error: " + err.message);
          } finally {
            if (upgradeBtn) {
              upgradeBtn.disabled = false;
              if (upgradeBtn.tagName === 'BUTTON') {
                upgradeBtn.innerText = originalText;
              } else {
                upgradeBtn.textContent = originalText;
              }
            }
          }
        },
        "modal": {
          "ondismiss": function() {
            if (upgradeBtn) {
              upgradeBtn.disabled = false;
              if (upgradeBtn.tagName === 'BUTTON') {
                upgradeBtn.innerText = originalText;
              } else {
                upgradeBtn.textContent = originalText;
              }
            }
          }
        },
        "prefill": {
          "name": window._authUser.user_metadata?.full_name || "",
          "email": window._authUser.email || "",
          "contact": state.userMobile || ""
        },
        "theme": {
          "color": "#7B2FF7"
        }
      };
      var rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (err) {
      console.error(err);
      alert("Failed to initiate payment: " + err.message);
      if (upgradeBtn) {
        upgradeBtn.disabled = false;
        if (upgradeBtn.tagName === 'BUTTON') {
          upgradeBtn.innerText = originalText;
        } else {
          upgradeBtn.textContent = originalText;
        }
      }
    }
  };

  // Show premium upgrade popup modal
  function showUpgradeModal() {
    let popup = document.getElementById("pmUpgradeModal");
    const isMobile = window.innerWidth <= 768;
    if (!popup) {
      popup = document.createElement("div");
      popup.id = "pmUpgradeModal";
      document.body.appendChild(popup);
    }
    
    popup.className = isMobile ? "pm-paywall-overlay" : "pm-modal-overlay";
    popup.style.display = "flex";

    if (isMobile) {
      popup.innerHTML = `
        <div class="pm-paywall-modal">
          <button class="pm-paywall-close-btn" onclick="document.getElementById('pmUpgradeModal').style.display='none'">&times;</button>
          <div class="pm-paywall-header-icon">🔒</div>
          <h2 class="pm-paywall-title">Unlock Unlimited Preferences</h2>
          <p class="pm-paywall-subtitle">
            Upgrade to Premium for ₹1 and create up to 3 complete preference lists with unlimited college additions, editing, and PDF export.
          </p>
          <div class="pm-paywall-benefits-card">
            <div class="pm-paywall-benefit-item"><i class="fas fa-check-circle"></i> Create 3 Complete Preference Lists</div>
            <div class="pm-paywall-benefit-item"><i class="fas fa-check-circle"></i> Unlimited College Additions</div>
            <div class="pm-paywall-benefit-item"><i class="fas fa-check-circle"></i> Edit Lists Anytime</div>
            <div class="pm-paywall-benefit-item"><i class="fas fa-check-circle"></i> Download PDF</div>
            <div class="pm-paywall-benefit-item"><i class="fas fa-check-circle"></i> Save Lists Permanently</div>
          </div>
          <div class="pm-paywall-price-section">
            <div class="pm-paywall-price">₹1 Only</div>
            <div class="pm-paywall-price-subtext">One-time payment</div>
          </div>
          <button class="pm-paywall-btn-primary" onclick="document.getElementById('pmUpgradeModal').style.display='none'; window.pmInitiatePremiumUpgrade();">
            Unlock Premium for ₹1
          </button>
          <button type="button" class="pm-paywall-btn-secondary" onclick="document.getElementById('pmUpgradeModal').style.display='none'">
            Continue with Free Version
          </button>
        </div>
      `;
    } else {
      popup.innerHTML = `
        <div class="pm-modal" style="max-width: 440px; text-align: center; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(21, 0, 41, 0.98);">
          <div class="pm-modal-header" style="justify-content: center; position: relative;">
            <h2 class="pm-modal-title" style="color: #FFC300; font-size: 20px;"><i class="fas fa-crown"></i> Unlock Unlimited Preferences</h2>
            <button class="pm-modal-close" style="position: absolute; right: 20px;" onclick="document.getElementById('pmUpgradeModal').style.display='none'">&times;</button>
          </div>
          <div class="pm-modal-body" style="padding: 24px;">
            <p style="font-size: 14px; line-height: 1.6; color: var(--pm-text-secondary); margin: 0 0 24px 0;">
              Upgrade to Premium for ₹99 and create up to 3 complete preference lists with unlimited college additions, editing, and PDF export.
            </p>
            <div style="display: flex; flex-direction: column; gap: 12px; align-items: center;">
              <button class="pm-btn pm-btn-yellow" style="background: #FFC300 !important; color: #1e0b36 !important; border: none !important; width: 100%; max-width: 280px; height: 48px; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer;" onclick="window.pmInitiatePremiumUpgrade()">
                Upgrade Now
              </button>
              <button type="button" class="pm-btn pm-btn-outline" style="background: transparent !important; border: 1.5px solid #7B2FF7 !important; color: #ffffff !important; width: 100%; max-width: 280px; height: 48px; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer;" onclick="document.getElementById('pmUpgradeModal').style.display='none'">
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      `;
    }
  }

  // Fetch or create user Preference Maker info and lists
  async function loadUserPreferenceMakerData() {
    if (!state.userMobile || !window.supabaseClient) return;

    const targetEmails = ["pks332023@gmail.com", "putin@gmail.com"];
    const userEmail = (window._authUser && window._authUser.email) ? window._authUser.email.trim().toLowerCase() : "";
    if (targetEmails.includes(userEmail)) return;

    try {
      let { data: userProfile, error: profileErr } = await window.supabaseClient
          .from('preference_maker_users')
          .select('*')
          .eq('email', window._authUser.email)
        .maybeSingle();

      if (profileErr) {
        console.warn("Could not load user profile from preference_maker_users, falling back to local storage:", profileErr.message);
        fallbackToLocalStorageMode();
        return;
      }

      if (!userProfile) {
        const insertData = {
          name: window._authUser.user_metadata?.full_name || window._authUser.user_metadata?.name || 'Student',
          mobile: state.userMobile,
          category: 'General',
          score: 0,
          rank: 0,
          domicile: 'N/A',
          course: 'MBBS'
        };

        try {
          const { data: newProfile, error: insErr } = await window.supabaseClient
            .from('preference_maker_users')
            .insert({
              ...insertData,
              email: window._authUser.email,
              attempts_used: 0,
              max_attempts: 1,
              plan_type: 'free',
              payment_status: 'unpaid',
              lists_remaining: 0
            })
            .select('*')
            .single();

          if (insErr) {
            console.warn("Inserting with premium columns failed. Retrying insertion with basic columns...");
            const { data: retryProfile, error: retryErr } = await window.supabaseClient
              .from('preference_maker_users')
              .insert(insertData)
              .select('*')
              .single();
            
            if (retryErr) throw retryErr;
            userProfile = retryProfile;
          } else {
            userProfile = newProfile;
          }
        } catch (insertCatchErr) {
          console.warn("Failed to create preference_maker_users profile, falling back to local storage:", insertCatchErr.message);
          fallbackToLocalStorageMode();
          return;
        }
      }

      state.planType = userProfile.plan_type || 'free';
      state.attemptsUsed = userProfile.attempts_used || 0;
      state.maxAttempts = userProfile.max_attempts != null ? userProfile.max_attempts : 1;
      state.listsRemaining = userProfile.lists_remaining || 0;
      state.paymentStatus = userProfile.payment_status || 'unpaid';
      state.userDetails = {
        name: userProfile.name,
        email: userProfile.email || window._authUser.email,
        category: userProfile.category,
        score: userProfile.score,
        rank: userProfile.rank,
        domicile: userProfile.domicile,
        course: userProfile.course
      };

      saveUserDetailsToCache();

      let lists = [];
      try {
        let { data: dbLists, error: listsErr } = await window.supabaseClient
          .from('preference_maker_lists')
          .select('*')
          .eq('mobile', state.userMobile)
          .order('created_at', { ascending: true });

        if (listsErr) throw listsErr;
        lists = dbLists;
      } catch (listQueryErr) {
        console.warn("preference_maker_lists table is missing or query failed. Falling back to local storage list mode.", listQueryErr.message);
        fallbackToLocalStorageMode();
        return;
      }

      if (!lists || lists.length === 0) {
        const { data: newList, error: createListErr } = await window.supabaseClient
          .from('preference_maker_lists')
          .insert({
            mobile: state.userMobile,
            list_name: 'Default List',
            colleges: []
          })
          .select('*')
          .single();

        if (createListErr) throw createListErr;
        lists = [newList];
      }

      state.lists = lists;

      if (!state.activeListId || !lists.some(l => l.id === state.activeListId)) {
        state.activeListId = lists[0].id;
      }

      const activeList = lists.find(l => l.id === state.activeListId);
      state.preferences = activeList.colleges || [];

      checkAndClearLegacyCache();
      saveToLocalStorage();
      updateListSelectorUI();
      window.renderPreferenceMakerTable();

    } catch (err) {
      console.error("Error loading user Preference Maker data:", err);
      fallbackToLocalStorageMode();
    }
  }

  function fallbackToLocalStorageMode() {
    state.planType = 'free';
    state.attemptsUsed = 0;
    state.maxAttempts = 1;
    state.listsRemaining = 0;
    state.paymentStatus = 'unpaid';
    state.lists = [{
      id: 'local-default',
      list_name: 'Default List (Local)',
      colleges: state.preferences
    }];
    state.activeListId = 'local-default';
    loadFromLocalStorage();
    checkAndClearLegacyCache();
    updateListSelectorUI();
    window.renderPreferenceMakerTable();
  }

  window.pmOnMobileSaved = async function(mobile) {
    state.userMobile = mobile;
    await loadUserPreferenceMakerData();
  };

  // Update List selection HTML and status display
  function updateListSelectorUI() {
    const badge = document.getElementById("pmUserBadge");
    const remaining = document.getElementById("pmRemainingLists");
    const select = document.getElementById("pmActiveListSelect");
    
    const isPremium = state.planType === 'premium' && state.paymentStatus === 'paid';
    if (badge) {
      badge.style.display = "none";
    }

    if (remaining) {
      if (isPremium) {
        remaining.innerHTML = `Preference Lists Remaining: ${state.listsRemaining} / 3`;
        remaining.style.display = "inline-block";
      } else {
        remaining.innerHTML = "";
        remaining.style.display = "none";
      }
    }

    if (select) {
      select.innerHTML = state.lists.map(l => 
        `<option value="${l.id}" ${state.activeListId === l.id ? 'selected' : ''}>${l.list_name}</option>`
      ).join('');
    }
  }

  // Switch active list callback
  window.pmSwitchActiveList = function(listId) {
    const parsedId = Number(listId);
    state.activeListId = parsedId;
    const activeList = state.lists.find(l => l.id === parsedId);
    if (activeList) {
      state.preferences = activeList.colleges || [];
      checkAndClearLegacyCache();
      saveToLocalStorage();
      window.renderPreferenceMakerTable();
    }
  };

  // Create new list action callback
  window.pmCreateNewList = async function() {
    const isPremium = state.planType === 'premium' && state.paymentStatus === 'paid';
    if (!isPremium) {
      showUpgradeModal();
      return;
    }

    if (state.listsRemaining <= 0) {
      alert("You have already used your 1 Premium Preference List.");
      return;
    }

    const listName = prompt("Enter a name for your new preference list:", `Preference List ${state.lists.length + 1}`);
    if (!listName || !listName.trim()) return;

    try {
      const { data: newList, error } = await window.supabaseClient
        .from('preference_maker_lists')
        .insert({
          mobile: state.userMobile,
          list_name: listName.trim(),
          colleges: []
        })
        .select('*')
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      alert("New preference list created successfully!");
      await loadUserPreferenceMakerData();
    } catch (err) {
      console.error(err);
      alert("Failed to create new list: " + err.message);
    }
  };

  // Sync state.preferences to DB active list
  async function syncActiveListWithDB() {
    const targetEmails = ["pks332023@gmail.com", "putin@gmail.com"];
    const userEmail = (window._authUser && window._authUser.email) ? window._authUser.email.trim().toLowerCase() : "";
    if (targetEmails.includes(userEmail)) {
      saveToLocalStorage();
      return true;
    }

    if (!state.activeListId || !state.userMobile || !window.supabaseClient || state.activeListId === 'local-default') {
      saveToLocalStorage();
      return true;
    }

    try {
      const { error } = await window.supabaseClient
        .from('preference_maker_lists')
        .update({ colleges: state.preferences })
        .eq('id', state.activeListId);

      if (error) {
        console.error("DB Sync Error:", error.message);
        if (error.message.includes("Free users can only add up to 10 colleges") || error.message.includes("up to 10 colleges")) {
          console.warn("Backend rejected >10 colleges. Allowing temporarily in frontend memory.");
          // Suppressing the popup and letting it save to LocalStorage so user can continue temporarily
        } else {
          alert("Error saving preferences: " + error.message);
          return false;
        }
      }
      
      const activeList = state.lists.find(l => l.id === state.activeListId);
      if (activeList) {
        activeList.colleges = [...state.preferences];
      }

      saveToLocalStorage();
      return true;
    } catch (err) {
      console.error("Error in syncActiveListWithDB:", err);
      alert("Failed to connect to database: " + err.message);
      return false;
    }
  }

  // Display premium styling popup when free/premium attempts limit is reached
  function showLimitReachedPopup() {
    let popup = document.getElementById('pmLimitReachedModal');
    if (!popup) {
      popup = document.createElement('div');
      popup.id = 'pmLimitReachedModal';
      document.body.appendChild(popup);
    }
    
    popup.innerHTML = `
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
        
        <h2 class="pm-upgrade-title">🔥 Upgrade Your Experience</h2>
        <p class="pm-upgrade-description">
          You have reached the free limit. Choose a plan below to continue creating and downloading your preference lists!
        </p>
        
        <div class="pm-plans-container">
          <!-- ₹99 Plan -->
          <div class="pm-plan-card">
            <div class="pm-plan-header">
              <div class="pm-plan-name">Basic Extension</div>
              <div class="pm-plan-price">₹99</div>
            </div>
            <div class="pm-plan-features">
              <div class="pm-plan-feature"><i class="fas fa-check-circle"></i> 3 Additional Preference Lists</div>
              <div class="pm-plan-feature"><i class="fas fa-check-circle"></i> Up to 3 PDF Downloads</div>
              <div class="pm-plan-feature"><i class="fas fa-check-circle"></i> Unlimited College Additions</div>
            </div>
            <button class="pm-plan-btn pm-plan-btn-secondary" onclick="window.confirmPmUpgradeOffer(99.00)">
              Unlock Basic • ₹99
            </button>
          </div>
          
          <!-- ₹199 Plan -->
          <div class="pm-plan-card featured">
            <div class="pm-plan-badge">BEST VALUE</div>
            <div class="pm-plan-header">
              <div class="pm-plan-name">Unlimited Access</div>
              <div class="pm-plan-price">₹199</div>
            </div>
            <div class="pm-plan-features">
              <div class="pm-plan-feature"><i class="fas fa-check-circle"></i> Unlimited Preference Lists</div>
              <div class="pm-plan-feature"><i class="fas fa-check-circle"></i> Unlimited PDF Downloads</div>
              <div class="pm-plan-feature"><i class="fas fa-check-circle"></i> Save Lists Permanently</div>
              <div class="pm-plan-feature"><i class="fas fa-check-circle"></i> Priority Support</div>
            </div>
            <button class="pm-plan-btn pm-plan-btn-primary" onclick="window.confirmPmUpgradeOffer(199.00)">
              Unlock Unlimited • ₹199
            </button>
          </div>
        </div>
        
        <button class="pm-skip-btn" onclick="window.closePmLimitReachedModal()">Maybe Later</button>
      </div>
    `;

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
      fetch(`${backendUrl}/razorpay-payment`, {
        method: "OPTIONS"
      }).catch(() => {});
    } catch (_) {}

    // Display overlay
    popup.style.display = "flex";
    setTimeout(() => {
      popup.classList.add("active");
    }, 10);
  }

  // Display premium styling popup when free college limit is reached
  function showUnlockUnlimitedCollegesPopup() {
    let popup = document.getElementById("pmUnlockUnlimitedModal");
    const isMobile = window.innerWidth <= 768;
    if (!popup) {
      popup = document.createElement("div");
      popup.id = "pmUnlockUnlimitedModal";
      document.body.appendChild(popup);
    }
    
    popup.className = isMobile ? "pm-paywall-overlay" : "pm-modal-overlay";
    popup.style.display = "flex";

    if (isMobile) {
      popup.innerHTML = `
        <div class="pm-paywall-modal">
          <button class="pm-paywall-close-btn" onclick="document.getElementById('pmUnlockUnlimitedModal').style.display='none'">&times;</button>
          <div class="pm-paywall-header-icon">🔒</div>
          <h2 class="pm-paywall-title">Unlock Unlimited Colleges</h2>
          <p class="pm-paywall-subtitle">
            Free users can add up to 10 colleges. Upgrade to Premium for ₹1 to add unlimited colleges and create up to 3 complete preference lists.
          </p>
          <div class="pm-paywall-benefits-card">
            <div class="pm-paywall-benefit-item"><i class="fas fa-check-circle"></i> Create 3 Complete Preference Lists</div>
            <div class="pm-paywall-benefit-item"><i class="fas fa-check-circle"></i> Unlimited College Additions</div>
            <div class="pm-paywall-benefit-item"><i class="fas fa-check-circle"></i> Edit Lists Anytime</div>
            <div class="pm-paywall-benefit-item"><i class="fas fa-check-circle"></i> Download PDF</div>
            <div class="pm-paywall-benefit-item"><i class="fas fa-check-circle"></i> Save Lists Permanently</div>
          </div>
          <div class="pm-paywall-price-section">
            <div class="pm-paywall-price">₹1 Only</div>
            <div class="pm-paywall-price-subtext">One-time payment</div>
          </div>
          <button class="pm-paywall-btn-primary" onclick="document.getElementById('pmUnlockUnlimitedModal').style.display='none'; window.pmInitiatePremiumUpgrade();">
            Unlock Premium for ₹1
          </button>
          <button type="button" class="pm-paywall-btn-secondary" onclick="document.getElementById('pmUnlockUnlimitedModal').style.display='none'">
            Continue with Free Version
          </button>
        </div>
      `;
    } else {
      popup.innerHTML = `
        <div class="pm-modal" style="max-width: 440px; text-align: center; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(21, 0, 41, 0.98);">
          <div class="pm-modal-header" style="justify-content: center; position: relative;">
            <h2 class="pm-modal-title" style="color: #FFC300; font-size: 20px;"><i class="fas fa-crown"></i> Unlock Unlimited Colleges</h2>
            <button class="pm-modal-close" style="position: absolute; right: 20px;" onclick="document.getElementById('pmUnlockUnlimitedModal').style.display='none'">&times;</button>
          </div>
          <div class="pm-modal-body" style="padding: 24px;">
            <p style="font-size: 14px; line-height: 1.6; color: var(--pm-text-secondary); margin: 0 0 24px 0;">
              Free users can add up to 10 colleges. Upgrade to Premium for ₹99 to add unlimited colleges and create up to 3 complete preference lists.
            </p>
            <div style="display: flex; flex-direction: column; gap: 12px; align-items: center;">
              <button class="pm-btn pm-btn-yellow" style="background: #FFC300 !important; color: #1e0b36 !important; border: none !important; width: 100%; max-width: 280px; height: 48px; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer;" onclick="document.getElementById('pmUnlockUnlimitedModal').style.display='none'; window.pmInitiatePremiumUpgrade();">
                Upgrade Now
              </button>
              <button type="button" class="pm-btn pm-btn-outline" style="background: transparent !important; border: 1.5px solid #7B2FF7 !important; color: #ffffff !important; width: 100%; max-width: 280px; height: 48px; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer;" onclick="document.getElementById('pmUnlockUnlimitedModal').style.display='none'">
                Continue Free
              </button>
            </div>
          </div>
        </div>
      `;
    }
  }

  // Check if adding another college is allowed (free limit of 10 colleges, and attempts limits)
  function checkCollegeAdditionLimit() {
    // If attempts limit is reached, lock everything
    if (state.attemptsUsed >= state.maxAttempts) {
      showLimitReachedPopup();
      return false;
    }
    // Unlimited college additions for everyone (no popup triggered here)
    return true;
  }

  // Deterministic hash function to generate stable fee/bond values for database entries
  function getDeterministicHash(str) {
    let hash = 0;
    const s = String(str);
    for (let i = 0; i < s.length; i++) {
      hash = s.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  }

  // LocalStorage helper routines
  function saveToLocalStorage() {
    try {
      localStorage.setItem('neet_preferences_v2', JSON.stringify(state.preferences));
    } catch (e) {
      console.error("Failed to save preferences to localStorage:", e);
    }
  }

  function loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('neet_preferences_v2');
      if (saved) {
        state.preferences = JSON.parse(saved);
        state.isLoaded = true;
        return true;
      }
    } catch (e) {
      console.error("Failed to load preferences from localStorage:", e);
    }
    return false;
  }

  // Initialize from storage immediately
  loadFromLocalStorage();

  function checkAndClearLegacyCache() {
    if (state.allColleges.length > 0 && state.preferences.length >= state.allColleges.length) {
      console.log("[Antigravity] Detected legacy pre-populated preferences cache. Resetting to empty list.");
      state.preferences = [];
      saveToLocalStorage();
      syncActiveListWithDB();
    }
  }


  // Get state badge class name
  function getStateBadgeClass(stateName) {
    const formatted = stateName.toLowerCase().replace(/\s+/g, '');
    const validStates = ['delhi', 'tamilnadu', 'gujarat', 'maharashtra', 'karnataka', 'uttarpradesh', 'puducherry'];
    if (validStates.includes(formatted)) {
      return `pm-badge-${formatted}`;
    }
    return 'pm-badge-default';
  }

  // Render function for the preference maker layout (invoked only once when navigating to the page)
  window.renderPreferenceMaker = function() {
    const container = document.getElementById("section-preference-maker");
    if (!container) return;

    // Only render the wrapper layout if the main table container and modals exist in the DOM
    if (!document.getElementById("pmTableBody") || !document.getElementById("pmDownloadModal") || !document.getElementById("pmModal")) {
      // Clean up any body-level relocated modals to prevent duplicates before layout injection
      const bodyModal = document.querySelector('body > #pmModal');
      const bodyDownloadModal = document.querySelector('body > #pmDownloadModal');
      if (bodyModal) bodyModal.remove();
      if (bodyDownloadModal) bodyDownloadModal.remove();

      // Create standard states list for the filter dropdown (sorted alphabetically)
      const statesList = Array.from(new Set(state.allColleges.map(p => p.state))).sort();

      let html = `
        <!-- Main Layout Section -->
        <div class="pm-container">
          <!-- Header & Action Row -->
          <div class="pm-header-row">
            <div class="pm-header-info">
              <h1 class="pm-title">Preference Maker</h1>
              <p class="pm-subtitle">Add and arrange your preferred medical colleges</p>
            </div>
            <div class="pm-actions">
              <button class="pm-btn pm-btn-outline" onclick="window.pmShowMyPreferences()" title="Show all your saved preferences">
                <i class="fas fa-list" style="color: var(--pm-accent-yellow);"></i> My Preferences
              </button>
              <button class="pm-btn pm-btn-outline" onclick="window.pmOpenDownloadModal()" title="Download your Preference List as PDF">
                <i class="fas fa-file-pdf" style="color: #ef4444;"></i> Download PDF
              </button>
              <button class="pm-btn pm-btn-outline" onclick="window.pmToggleFilters()">
                <i class="fas fa-filter"></i> Filters
              </button>
              <button class="pm-btn pm-btn-filled" onclick="window.pmResetPreferences()" title="Clear all your saved preferences">
                <i class="fas fa-sync-alt"></i> Reset
              </button>
            </div>
          </div>

          <!-- Premium Plan & List Selector Row -->
          <div class="pm-list-selector-row" style="display: none !important;">
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
              <span class="pm-badge" id="pmUserBadge" style="padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; border: 1px solid; transition: all 0.2s ease;"></span>
              <span id="pmRemainingLists" style="font-size: 13px; color: var(--pm-text-secondary); font-weight: 500;"></span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <label for="pmActiveListSelect" style="font-size: 13px; font-weight: 600; color: var(--pm-text-secondary);">Select List:</label>
              <select id="pmActiveListSelect" class="pm-form-control" style="width: auto; min-width: 180px; height: 38px; padding: 0 12px; border-radius: 8px; font-size: 13px;" onchange="window.pmSwitchActiveList(this.value)"></select>
              <button class="pm-btn pm-btn-outline" style="height: 38px; padding: 0 16px; border-radius: 8px; font-size: 13px; display: flex; align-items: center; gap: 6px;" onclick="window.pmCreateNewList()">
                <i class="fas fa-plus"></i> New List
              </button>
            </div>
          </div>

          <!-- Filters Expandable Card -->
          <div class="pm-filter-panel" id="pmFilterPanel">
            <div class="pm-form-group">
              <label for="pmSearchInput">Search Colleges</label>
              <input type="text" id="pmSearchInput" class="pm-form-control" placeholder="Search by name..." value="${state.filters.search}">
            </div>
            <div class="pm-form-group">
              <label for="pmStateFilter">Filter State</label>
              <select id="pmStateFilter" class="pm-form-control">
                <option value="All">All States</option>
                ${statesList.map(st => `<option value="${st}" ${state.filters.state === st ? 'selected' : ''}>${st}</option>`).join('')}
              </select>
            </div>
            <div class="pm-form-group">
              <label for="pmCourseFilter">Filter Course</label>
              <select id="pmCourseFilter" class="pm-form-control">
                <option value="All" ${state.filters.course === 'All' ? 'selected' : ''}>All Courses</option>
                <option value="MBBS" ${state.filters.course === 'MBBS' ? 'selected' : ''}>MBBS</option>
                <option value="BDS" ${state.filters.course === 'BDS' ? 'selected' : ''}>BDS</option>
                <option value="BAMS" ${state.filters.course === 'BAMS' ? 'selected' : ''}>BAMS</option>
              </select>
            </div>
            <div class="pm-form-group">
              <label for="pmFeesFilter">Max Fees (₹)</label>
              <input type="number" id="pmFeesFilter" class="pm-form-control" placeholder="e.g. 20000" value="${state.filters.maxFees}">
            </div>
          </div>

          <!-- College Table Card -->
          <div class="pm-table-card">
            <table class="pm-table">
              <thead>
                <tr>
                  <th style="width: 180px;">Preference Order</th>
                  <th>College Name</th>
                  <th style="width: 160px;">State</th>
                  <th style="width: 140px;">Fees (₹)</th>
                  <th>Bond Details</th>
                  <th style="width: 150px;">Actions</th>
                </tr>
              </thead>
              <tbody id="pmTableBody"></tbody>
            </table>

            <!-- Pagination Footer -->
            <div id="pmPaginationWrapper"></div>
          </div>
        </div>

        <!-- Add / Edit College Modal Overlay -->
        <div class="pm-modal-overlay" id="pmModal">
          <div class="pm-modal">
            <div class="pm-modal-header">
              <h2 class="pm-modal-title" id="pmModalTitle">Add College</h2>
              <button class="pm-modal-close" onclick="window.pmCloseModal()">&times;</button>
            </div>
            <form id="pmCollegeForm" onsubmit="window.pmHandleFormSubmit(event)">
              <div class="pm-modal-body">
                <div class="pm-form-group">
                  <label for="colName">College Name</label>
                  <input type="text" id="colName" class="pm-form-control" required placeholder="Enter medical college name">
                </div>
                <div class="pm-form-group">
                  <label for="colState">State</label>
                  <input type="text" id="colState" class="pm-form-control" required placeholder="Enter state name (e.g., Delhi, Gujarat)">
                </div>
                <div class="pm-form-group">
                  <label for="colFees">Fees (₹ per annum)</label>
                  <input type="number" id="colFees" class="pm-form-control" required placeholder="e.g. 15000">
                </div>
                <div class="pm-form-group">
                  <label for="colBond">Bond Details</label>
                  <input type="text" id="colBond" class="pm-form-control" placeholder="e.g. 1 Year Rural Service | Penalty: 10 Lakhs">
                </div>
              </div>
              <div class="pm-modal-footer">
                <button type="button" class="pm-btn pm-btn-outline" style="height: 44px; padding: 0 16px; border-radius: 10px;" onclick="window.pmCloseModal()">Cancel</button>
                <button type="submit" class="pm-btn pm-btn-filled" style="height: 44px; padding: 0 16px; border-radius: 10px;" id="pmModalSubmitBtn">Add College</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Candidate Details Form Modal Overlay -->
        <div class="pm-modal-overlay" id="pmDownloadModal">
          <div class="pm-modal">
            <div class="pm-modal-header">
              <h2 class="pm-modal-title">Candidate Details</h2>
              <button class="pm-modal-close" onclick="window.pmCloseDownloadModal()">&times;</button>
            </div>
            <form id="pmDownloadForm" onsubmit="window.pmHandleDetailsSubmit(event)">
              <div class="pm-modal-body">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div class="pm-form-group" style="grid-column: span 2;">
                    <label for="pdfName">Name</label>
                    <input type="text" id="pdfName" class="pm-form-control" required placeholder="Enter candidate's full name">
                  </div>
                  <div class="pm-form-group">
                    <label for="pdfCategory">Category</label>
                    <input type="text" id="pdfCategory" class="pm-form-control" placeholder="e.g. General, OBC, SC, ST">
                  </div>
                  <div class="pm-form-group">
                    <label for="pdfMobileNum">Mobile Number</label>
                    <input type="tel" id="pdfMobileNum" class="pm-form-control" required pattern="[0-9]{10}" placeholder="Enter 10-digit number">
                  </div>
                  <div class="pm-form-group">
                    <label for="pdfScore">NEET Score</label>
                    <input type="number" id="pdfScore" class="pm-form-control" max="720" placeholder="e.g. 680">
                  </div>
                  <div class="pm-form-group">
                    <label for="pdfRank">NEET Rank (AIR)</label>
                    <input type="number" id="pdfRank" class="pm-form-control" placeholder="e.g. 1500">
                  </div>
                  <div class="pm-form-group">
                    <label for="pdfState">State</label>
                    <input type="text" id="pdfState" class="pm-form-control" placeholder="e.g. Delhi, Rajasthan">
                  </div>
                  
                </div>
              </div>
              <div class="pm-modal-footer">
                <button type="button" class="pm-btn pm-btn-outline" style="height: 44px; padding: 0 16px; border-radius: 10px;" onclick="window.pmCloseDownloadModal()">Cancel</button>
                <button type="submit" class="pm-btn pm-btn-filled" style="height: 44px; padding: 0 16px; border-radius: 10px;">Save & Continue</button>
              </div>
            </form>
          </div>
        </div>
      `;

      container.innerHTML = html;

      // Relocate modals to document.body to ensure position: fixed aligns with viewport
      const pmModal = document.getElementById("pmModal");
      const pmDownloadModal = document.getElementById("pmDownloadModal");
      if (pmModal) document.body.appendChild(pmModal);
      if (pmDownloadModal) document.body.appendChild(pmDownloadModal);

      // Centralized event delegation for row action buttons
      const tableBody = document.getElementById("pmTableBody");
      if (tableBody) {
        tableBody.addEventListener("click", function(e) {
          console.log("[Antigravity Debug] Table body clicked. Target element:", e.target);
          const addRowBtn = e.target.closest('.pm-add-row-btn');
          const deleteBtn = e.target.closest('.pm-delete-btn');
          const upBtn = e.target.closest('.pm-nav-up-btn');
          const downBtn = e.target.closest('.pm-nav-down-btn');
          console.log("[Antigravity Debug] closest addRowBtn:", addRowBtn, "closest deleteBtn:", deleteBtn, "closest upBtn:", upBtn, "closest downBtn:", downBtn);
          
          if (addRowBtn) {
            e.preventDefault();
            e.stopPropagation();
            const tr = addRowBtn.closest('tr');
            console.log("[Antigravity Debug] Add Similar button clicked. Target row:", tr);
            if (tr) {
              const id = tr.getAttribute('data-id');
              console.log("[Antigravity Debug] Row ID to copy details from:", id);
              window.pmOpenAddModalWithData(e, id);
            }
          } else if (deleteBtn) {
            e.preventDefault();
            e.stopPropagation();
            const tr = deleteBtn.closest('tr');
            console.log("[Antigravity Debug] Delete button clicked. Target row:", tr);
            if (tr) {
              const id = tr.getAttribute('data-id');
              console.log("[Antigravity Debug] Row ID to delete:", id);
              window.pmDeleteCollege(e, id);
            }
          } else if (upBtn) {
            e.preventDefault();
            e.stopPropagation();
            const tr = upBtn.closest('tr');
            if (tr) {
              const id = tr.getAttribute('data-id');
              window.pmMovePreferenceUp(id);
            }
          } else if (downBtn) {
            e.preventDefault();
            e.stopPropagation();
            const tr = downBtn.closest('tr');
            if (tr) {
              const id = tr.getAttribute('data-id');
              window.pmMovePreferenceDown(id);
            }
          }
        });
      }

      // Attach search and filter event listeners
      const searchInput = document.getElementById("pmSearchInput");
      const stateFilter = document.getElementById("pmStateFilter");
      const feesFilter = document.getElementById("pmFeesFilter");

      if (searchInput) {
        searchInput.addEventListener("input", function(e) {
          state.filters.search = e.target.value;
          window.renderPreferenceMakerTable();
        });
      }

      if (stateFilter) {
        stateFilter.addEventListener("change", function(e) {
          state.filters.state = e.target.value;
          window.renderPreferenceMakerTable();
        });
      }

      const courseFilter = document.getElementById("pmCourseFilter");
      if (courseFilter) {
        courseFilter.addEventListener("change", function(e) {
          state.filters.course = e.target.value;
          window.renderPreferenceMakerTable();
        });
      }

      if (feesFilter) {
        feesFilter.addEventListener("input", function(e) {
          state.filters.maxFees = e.target.value;
          window.renderPreferenceMakerTable();
        });
      }


    }

    // Render table rows and pagination dynamically
    window.renderPreferenceMakerTable();

    // Trigger Supabase fetch if not loaded and not already loading
    if (!state.dbLoaded && !state.isLoading) {
      loadCollegesFromSupabase();
    }

    // Auth validation overlay check
    const pmContainer = container.querySelector(".pm-container");
    const existingOverlay = document.getElementById("pmAuthOverlay");
    if (existingOverlay) existingOverlay.remove();
    if (pmContainer) {
      pmContainer.style.filter = "";
      pmContainer.style.pointerEvents = "";
      pmContainer.style.userSelect = "";
    }

    if (!window._authUser) {
      if (pmContainer) {
        pmContainer.style.filter = "blur(12px)";
        pmContainer.style.pointerEvents = "none";
        pmContainer.style.userSelect = "none";
      }

      const overlay = document.createElement("div");
      overlay.id = "pmAuthOverlay";
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.zIndex = "10000005";
      overlay.style.background = "rgba(15, 7, 36, 0.45)";
      overlay.style.backdropFilter = "blur(8px)";
      overlay.style.webkitBackdropFilter = "blur(8px)";
      overlay.innerHTML = `
        <div class="pm-modal" style="max-width: 420px; text-align: center; border-radius: 24px; padding: 40px 30px; border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(45, 11, 82, 0.95); box-shadow: 0 20px 50px rgba(0,0,0,0.6);">
          <div style="font-size: 50px; margin-bottom: 20px; filter: drop-shadow(0 0 12px rgba(244, 180, 0, 0.5));">🔒</div>
          <h2 style="color: #fff; font-size: 24px; font-weight: 800; margin-bottom: 12px;">Access Restricted</h2>
          <p class="pm-auth-desc" style="color: rgba(255, 255, 255, 0.7); font-size: 14px; line-height: 1.6; margin: 0 0 30px 0;">
            To design, organize, and download your personalized college preference list, please sign in or create an account first.
          </p>
          <div class="pm-auth-btn-container">
            <button class="pm-auth-btn-primary" onclick="window.navigate('login')">
              Sign In / Register
            </button>
            <button type="button" class="pm-auth-btn-secondary" onclick="window.navigate('home')">
              Return to Home
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    }

    if (window._authUser) {
      if (!state.userDataPromise || state.userDataPromiseUserId !== window._authUser.id) {
        state.userDataPromiseUserId = window._authUser.id;
        state.userDataPromise = (async () => {
          // Load cached user details if available
          try {
            const cachedDetails = localStorage.getItem('pm_user_details');
            if (cachedDetails) {
              const parsed = JSON.parse(cachedDetails);
              if (parsed && parsed.userId === window._authUser.id) {
                if (parsed.mobile && parsed.userDetails && parsed.userDetails.name) {
                  state.userMobile = parsed.mobile;
                  state.userDetails = parsed.userDetails;
                  console.log("[Preference Maker] Loaded cached user details:", state.userDetails);
                  updateListSelectorUI();
                  // Asynchronously fetch latest data in background to sync
                  loadUserPreferenceMakerData().catch(console.error);
                  return; // Cache hit: resolve immediately
                }
              }
            }
          } catch (e) {
            console.warn("Failed to load cached user details:", e);
          }

          if (!state.userMobile) {
            try {
              if (window.supabaseClient) {
                const { data, error } = await window.supabaseClient
                  .from('users')
                  .select('mobile_number')
                  .eq('id', window._authUser.id)
                  .maybeSingle();
                
                if (error) throw error;
                
                if (data && data.mobile_number) {
                  state.userMobile = data.mobile_number;
                  await loadUserPreferenceMakerData();
                } else {
                  console.log("[Preference Maker] User has no mobile number yet. Details form will collect it on first action.");
                  updateListSelectorUI();
                }
              }
            } catch (err) {
              console.error("Error loading user mobile number:", err);
              updateListSelectorUI();
            }
          } else {
            updateListSelectorUI();
          }
        })();
      }
    }
  };

  let backgroundFetchStarted = false;

  // Asynchronously fetch colleges from Supabase with realistic fallbacks
  async function loadCollegesFromSupabase() {
    if (state.isLoading) return;

    // Load from localStorage cache first if state.allColleges is empty
    if (state.allColleges.length === 0) {
      try {
        const savedColleges = localStorage.getItem('pm_cached_colleges');
        if (savedColleges) {
          const parsed = JSON.parse(savedColleges);
          if (parsed && parsed.length > 0) {
            state.allColleges = parsed;
            state.dbLoaded = true;
            // Trigger a render so the UI displays the cached colleges immediately
            setTimeout(() => {
              forceRenderLayout();
            }, 0);
          }
        }
      } catch (e) {
        console.warn("Failed to load cached colleges:", e);
      }
    }

    // If we already have colleges AND we have already fetched from DB in this session, return
    if (state.allColleges.length > 0 && backgroundFetchStarted) {
      return;
    }

    state.isLoading = true;

    // Show loading spinner ONLY if we don't have cached colleges to display
    const tableBody = document.getElementById("pmTableBody");
    if (state.allColleges.length === 0 && tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--pm-text-secondary); padding: 48px;">
            <div class="pm-loading-spinner" style="margin: 0 auto 16px auto;"></div>
            <span>Loading colleges from database...</span>
          </td>
        </tr>
      `;
    }

    try {
      if (!window.supabaseClient) {
        throw new Error("Supabase client is not available.");
      }

      const { data, error } = await window.supabaseClient
        .from('college_preferences')
        .select('id, college_name, state, fees, bond_details')
        .order('id', { ascending: true })
        .limit(10000);

      if (error) throw error;

      if (data) {
        const mapped = data.map((c) => {
          return {
            id: c.id,
            name: c.college_name,
            state: c.state ? c.state.trim() : 'N/A',
            fees: c.fees || 0,
            bond: c.bond_details || 'N/A'
          };
        });

        backgroundFetchStarted = true;

        // Check if data is different from cache to avoid redundant DOM refreshes
        const hasCache = state.allColleges.length > 0;
        const cacheDifferent = JSON.stringify(state.allColleges) !== JSON.stringify(mapped);

        if (!hasCache || cacheDifferent) {
          state.allColleges = mapped;
          state.dbLoaded = true;
          try {
            localStorage.setItem('pm_cached_colleges', JSON.stringify(mapped));
          } catch (e) {
            console.error("Failed to save colleges to cache:", e);
          }
          
          checkAndClearLegacyCache();
          
          // Disable loading state before triggering re-render
          state.isLoading = false;
          
          // Full layout refresh to populate the filter dropdown with actual states
          forceRenderLayout();
        } else {
          state.isLoading = false;
        }
      }
    } catch (err) {
      console.error("Failed to load colleges:", err);
      // If we don't have any colleges (cache missing/corrupted and DB fetch failed), show error UI
      if (state.allColleges.length === 0 && tableBody) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; color: #ef4444; padding: 48px;">
              <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 12px;"></i><br>
              Failed to load colleges from database: ${err.message || err}<br>
              <button class="pm-btn pm-btn-outline" style="height: 38px; padding: 0 16px; margin-top: 16px; font-size: 14px;" onclick="window.pmRetryLoadColleges()">
                <i class="fas fa-sync-alt"></i> Retry
              </button>
            </td>
          </tr>
        `;
      }
    } finally {
      state.isLoading = false;
    }
  }

  function forceRenderLayout() {
    const container = document.getElementById("section-preference-maker");
    if (container) {
      container.innerHTML = "";
    }
    window.renderPreferenceMaker();
  }

  window.pmRetryLoadColleges = function() {
    backgroundFetchStarted = false;
    state.isLoading = false;
    loadCollegesFromSupabase();
  };

  // Render function for table body & pagination elements only (retains typing focus on filter fields)
  window.renderPreferenceMakerTable = function() {
    const tableBody = document.getElementById("pmTableBody");
    const paginationWrapper = document.getElementById("pmPaginationWrapper");
    if (!tableBody) return;

    if (state.isLoading && state.allColleges.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--pm-text-secondary); padding: 48px;">
            <div class="pm-loading-spinner" style="margin: 0 auto 16px auto;"></div>
            <span>Loading colleges from database...</span>
          </td>
        </tr>
      `;
      return;
    }

    // Toggle button text in header dynamically
    const myPrefBtn = document.querySelector('[onclick="window.pmShowMyPreferences()"]');
    if (myPrefBtn) {
      if (state.viewMode === "all") {
        myPrefBtn.innerHTML = `<i class="fas fa-list" style="color: var(--pm-accent-yellow);"></i> My Preferences`;
        myPrefBtn.title = "Show all your saved preferences";
      } else {
        myPrefBtn.innerHTML = `<i class="fas fa-globe" style="color: var(--pm-accent-yellow);"></i> Show All Colleges`;
        myPrefBtn.title = "Show all available colleges";
      }
    }

    // Determine source list based on view mode
    const sourceList = state.viewMode === "all" ? state.allColleges : state.preferences;

    // Filter list
    const filteredPreferences = sourceList.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(state.filters.search.toLowerCase());
      const matchState = state.filters.state === "All" || item.state === state.filters.state;
      
      let matchCourse = true;
      if (state.filters.course && state.filters.course !== "All") {
        const nameLower = item.name.toLowerCase();
        if (state.filters.course === "BDS") {
          matchCourse = nameLower.includes("dental") || nameLower.includes("bds") || nameLower.includes("dentistry") || nameLower.includes("d.c.") || nameLower.includes("dc,");
        } else if (state.filters.course === "BAMS") {
          matchCourse = nameLower.includes("ayurved") || nameLower.includes("bams") || nameLower.includes("ayurveda") || nameLower.includes("ayurvedic") || nameLower.includes("vaidyak") || nameLower.includes("tibbia") || nameLower.includes("unani");
        } else if (state.filters.course === "MBBS") {
          matchCourse = !nameLower.includes("dental") && !nameLower.includes("bds") && !nameLower.includes("dentistry") && !nameLower.includes("d.c.") && !nameLower.includes("dc,") && !nameLower.includes("ayurved") && !nameLower.includes("bams") && !nameLower.includes("ayurveda") && !nameLower.includes("ayurvedic") && !nameLower.includes("vaidyak") && !nameLower.includes("tibbia") && !nameLower.includes("unani");
        }
      }
      
      const matchFees = !state.filters.maxFees || item.fees <= Number(state.filters.maxFees);
      return matchSearch && matchState && matchCourse && matchFees;
    });

    // Populate rows
    tableBody.innerHTML = filteredPreferences.length > 0 ? filteredPreferences.map((college, idx) => {
      const isSaved = state.preferences.some(p => String(p.id) === String(college.id));
      
      let actionHtml = '';
      if (state.viewMode === 'all') {
        if (isSaved) {
          actionHtml = `
            <button type="button" class="pm-row-btn pm-btn-selected" style="cursor: default;" title="Added to Preferences">
              <i class="fas fa-check"></i>
            </button>
          `;
        } else {
          actionHtml = `
            <button type="button" class="pm-row-btn pm-add-row-btn pm-btn-unselected" title="Add to Preferences">
              <i class="fas fa-plus"></i>
            </button>
          `;
        }
      } else {
        const globalIdx = state.preferences.findIndex(p => String(p.id) === String(college.id));
        const isFirst = globalIdx === 0;
        const isLast = globalIdx === state.preferences.length - 1;

        actionHtml = `
          <button type="button" class="pm-nav-up-btn" title="Move Up" ${isFirst ? 'disabled' : ''}>
            <i class="fas fa-arrow-up"></i>
          </button>
          <button type="button" class="pm-nav-down-btn" title="Move Down" ${isLast ? 'disabled' : ''}>
            <i class="fas fa-arrow-down"></i>
          </button>
          <button type="button" class="pm-row-btn pm-delete-btn" title="Delete Preference">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
      }

      // Drag and order badge display
      let orderHtml = '';
      if (state.viewMode === 'preferences') {
        orderHtml = `
          <div class="pm-drag-cell">
            <div class="pm-drag-handle" draggable="true" title="Drag to reorder"><i class="fas fa-grip-vertical"></i></div>
            <div class="pm-order-badge">${idx + 1}</div>
          </div>
        `;
      } else {
        orderHtml = `
          <div class="pm-drag-cell">
            <div class="pm-order-badge" style="cursor: default;">${idx + 1}</div>
          </div>
        `;
      }

      // Mobile Action HTML
      let mobileActionHtml = '';
      if (state.viewMode === 'all') {
        if (isSaved) {
          mobileActionHtml = `
            <button type="button" class="pm-row-btn pm-btn-selected" style="cursor: default;" title="Added to Preferences">
              <i class="fas fa-check"></i>
            </button>
          `;
        } else {
          mobileActionHtml = `
            <button type="button" class="pm-row-btn pm-add-row-btn pm-btn-unselected" title="Add to Preferences">
              <i class="fas fa-plus"></i>
            </button>
          `;
        }
      } else {
        const globalIdx = state.preferences.findIndex(p => String(p.id) === String(college.id));
        const isFirst = globalIdx === 0;
        const isLast = globalIdx === state.preferences.length - 1;

        mobileActionHtml = `
          <div class="pm-mobile-actions-wrapper">
            <button type="button" class="pm-nav-up-btn" title="Move Up" ${isFirst ? 'disabled' : ''}>
              <i class="fas fa-arrow-up"></i>
            </button>
            <button type="button" class="pm-nav-down-btn" title="Move Down" ${isLast ? 'disabled' : ''}>
              <i class="fas fa-arrow-down"></i>
            </button>
            <button type="button" class="pm-row-btn pm-delete-btn" title="Delete Preference">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        `;
      }

      // Mobile Order Badge HTML
      let mobileOrderHtml = '';
      if (state.viewMode === 'preferences') {
        mobileOrderHtml = `
          <div class="pm-card-order-wrapper">
            <div class="pm-drag-handle" draggable="true" title="Drag to reorder"><i class="fas fa-grip-vertical"></i></div>
            <div class="pm-card-order-badge">${idx + 1}</div>
          </div>
        `;
      } else {
        mobileOrderHtml = `
          <div class="pm-card-order-wrapper">
            <div class="pm-card-order-badge" style="cursor: default;">${idx + 1}</div>
          </div>
        `;
      }

      return `
        <tr data-id="${college.id}" data-index="${idx}" class="pm-college-row">
          <!-- Desktop View Cells -->
          <td class="pm-desktop-only">
            ${orderHtml}
          </td>
          <td class="pm-desktop-only">
            <div class="pm-college-info-wrapper">
              <span class="pm-college-name">${college.name}</span>
            </div>
          </td>
          <td class="pm-desktop-only">
            <span class="pm-badge ${getStateBadgeClass(college.state)}">${college.state}</span>
          </td>
          <td class="pm-desktop-only">
            <span class="pm-fees">${formatFees(college.fees)}</span>
          </td>
          <td class="pm-desktop-only">
            <span class="pm-bond">${college.bond || "N/A"}</span>
          </td>
          <td class="pm-desktop-only">
            <div class="pm-row-actions">
              ${actionHtml}
            </div>
          </td>

          <!-- Mobile View Premium Card Cell -->
          <td class="pm-mobile-only" colspan="6">
            <div class="pm-mobile-card">
              <!-- Top Row: Order Badge, Title, and Actions -->
              <div class="pm-card-top-row">
                <div class="pm-card-top-left">
                  ${mobileOrderHtml}
                  <h3 class="pm-card-title">${college.name}</h3>
                </div>
                <div class="pm-card-actions">
                  ${mobileActionHtml}
                </div>
              </div>

              <!-- Second Row: State badge, Fee badge -->
              <div class="pm-card-second-row">
                <span class="pm-card-state-badge ${getStateBadgeClass(college.state)}">${college.state}</span>
                <span class="pm-card-fee-badge">${(!college.fees || Number(college.fees) === 0) ? '-' : '₹' + formatFees(college.fees)}</span>
              </div>

              <!-- Third Row: Bond details container -->
              <div class="pm-card-third-row">
                <div class="pm-bond-container">
                  ${formatBondDetails(college.bond)}
                </div>
              </div>
            </div>
          </td>
        </tr>
      `;
    }).join('') : `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--pm-text-secondary); padding: 48px;">
          ${state.viewMode === 'all' ? 'No colleges found. Try adjusting your filters.' : 'No preferences saved yet. Go back to Show All Colleges to add some!'}
        </td>
      </tr>
    `;

    // Populate pagination
    if (paginationWrapper) {
      paginationWrapper.innerHTML = `
        <div class="pm-pagination-row">
          <div class="pm-pagination-info">
            Showing 1 to ${filteredPreferences.length} of ${filteredPreferences.length} preferences (All preferences displayed on a single page)
          </div>
          <ul class="pm-pagination-list">
            <li class="pm-pagination-item pm-pagination-item-inactive" style="opacity: 0.5; cursor: not-allowed;">
              <i class="fas fa-chevron-left"></i>
            </li>
            <li class="pm-pagination-item pm-pagination-item-active">1</li>
            <li class="pm-pagination-item pm-pagination-item-inactive" style="opacity: 0.5; cursor: not-allowed;">
              <i class="fas fa-chevron-right"></i>
            </li>
          </ul>
        </div>
      `;
    }

    // Reattach drag and drop events
    initDragAndDrop();
  };

  // Toggle view mode between all colleges and preferences list
  window.pmShowMyPreferences = function() {
    state.viewMode = state.viewMode === "all" ? "preferences" : "all";
    console.log("[Antigravity Debug] pmShowMyPreferences clicked. Switch viewMode to:", state.viewMode);
    
    // Also reset filter UI values when switching views to ensure clean state
    state.filters.search = "";
    state.filters.state = "All";
    state.filters.course = "All";
    state.filters.maxFees = "";
    const searchInput = document.getElementById("pmSearchInput");
    const stateFilter = document.getElementById("pmStateFilter");
    const courseFilter = document.getElementById("pmCourseFilter");
    const feesFilter = document.getElementById("pmFeesFilter");
    if (searchInput) searchInput.value = "";
    if (stateFilter) stateFilter.value = "All";
    if (courseFilter) courseFilter.value = "All";
    if (feesFilter) feesFilter.value = "";

    window.renderPreferenceMakerTable();
  };

  // Toggle Filters Panel Expand
  window.pmToggleFilters = function() {
    const filterPanel = document.getElementById("pmFilterPanel");
    if (!filterPanel) return;
    filterPanel.classList.toggle("active");
    window.filtersActive = filterPanel.classList.contains("active");
  };

  // Add College Modal Open
  window.pmOpenAddModal = function() {
    if (!checkCollegeAdditionLimit()) {
      return;
    }
    state.editingId = null;
    document.getElementById("pmModalTitle").innerText = "Add College";
    document.getElementById("pmModalSubmitBtn").innerText = "Add College";
    document.getElementById("pmCollegeForm").reset();
    document.getElementById("pmModal").style.display = "flex";
  };

  // Add College from All Colleges list directly into preferences list
  window.pmOpenAddModalWithData = async function(e, id) {
    console.log("[Antigravity Debug] pmOpenAddModalWithData entered (add to preferences). e:", e, "id:", id);
    if (typeof e === 'string' && id === undefined) {
      id = e;
    } else if (e && e.stopPropagation) {
      e.stopPropagation();
    }

    if (!checkCollegeAdditionLimit()) {
      return;
    }

    const college = state.allColleges.find(item => String(item.id) === String(id));
    if (!college) return;

    // Wait for user details to load to prevent showing details form repeatedly
    if (state.userDataPromise) {
      await state.userDataPromise;
    }

    const targetEmails = ["pks332023@gmail.com", "putin@gmail.com"];
    const userEmail = (window._authUser && window._authUser.email) ? window._authUser.email.toLowerCase() : "";
    const isTargetUser = targetEmails.includes(userEmail);

    // Check if we need to show candidate details form (adding the first college or details missing)
    if (!isTargetUser && !isDetailsFilled()) {
      state.pendingAction = {
        type: 'add-college',
        college: college
      };
      window.pmOpenDetailsModal();
      return;
    }
    
    // Check if it's already in preferences to avoid duplication
    const alreadyExists = state.preferences.some(item => String(item.id) === String(id));
    if (!alreadyExists) {
      const previousPreferences = [...state.preferences];
      state.preferences.push({
        id: college.id,
        name: college.name,
        state: college.state,
        fees: college.fees,
        bond: college.bond
      });
      console.log(`[Antigravity Debug] Added college to preferences list:`, college.name);
      
      const success = await syncActiveListWithDB();
      if (!success) {
        state.preferences = previousPreferences;
      }
    }

    // Re-render table to display the green checkmark
    window.renderPreferenceMakerTable();
  };

  // Edit College Modal Open
  window.pmOpenEditModal = function(e, id) {
    // If called without event argument (backward compatibility)
    if (typeof e === 'string' && id === undefined) {
      id = e;
    }
    const college = state.preferences.find(item => String(item.id) === String(id));
    if (!college) return;
    state.editingId = id;
    document.getElementById("pmModalTitle").innerText = "Edit College Preference";
    document.getElementById("pmModalSubmitBtn").innerText = "Save Changes";

    document.getElementById("colName").value = college.name;
    document.getElementById("colState").value = college.state;
    document.getElementById("colFees").value = college.fees;
    document.getElementById("colBond").value = college.bond || "";

    const overlay = document.getElementById("pmModal");
    const modalContent = overlay.querySelector('.pm-modal');
    
    // Clear any previous inline styles to ensure default flex centering
    if (modalContent) {
      modalContent.style.position = '';
      modalContent.style.top = '';
      modalContent.style.left = '';
      modalContent.style.transform = '';
      modalContent.style.margin = '';
    }
    
    // Show overlay (flex aligns it centered in viewport)
    overlay.style.display = "flex";
  };

  // Close Modal
  window.pmCloseModal = function() {
    const overlay = document.getElementById("pmModal");
    if (overlay) {
      overlay.style.display = "none";
      const modalContent = overlay.querySelector('.pm-modal');
      if (modalContent) {
        modalContent.style.position = '';
        modalContent.style.top = '';
        modalContent.style.left = '';
        modalContent.style.transform = '';
        modalContent.style.margin = '';
      }
    }
    state.editingId = null;
  };

  // Add/Edit Form submission
  window.pmHandleFormSubmit = async function(e) {
    e.preventDefault();
    const name = document.getElementById("colName").value.trim();
    const stateVal = document.getElementById("colState").value.trim();
    const fees = Number(document.getElementById("colFees").value);
    const bond = document.getElementById("colBond").value.trim();

    if (state.editingId !== null) {
      // Edit state
      const previousPreferences = [...state.preferences];
      const collegeIdx = state.preferences.findIndex(item => String(item.id) === String(state.editingId));
      if (collegeIdx !== -1) {
        state.preferences[collegeIdx] = {
          ...state.preferences[collegeIdx],
          name: name,
          state: stateVal,
          fees: fees,
          bond: bond
        };
      }
      window.pmCloseModal();
      const success = await syncActiveListWithDB();
      if (!success) {
        state.preferences = previousPreferences;
      }
      window.renderPreferenceMakerTable();
    } else {
      // Add state
      if (!checkCollegeAdditionLimit()) {
        window.pmCloseModal();
        return;
      }

      const newId = 'custom-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      const customCollege = {
        id: newId,
        name: name,
        state: stateVal,
        fees: fees,
        bond: bond
      };

      // Wait for user details to load to prevent showing details form repeatedly
      if (state.userDataPromise) {
        await state.userDataPromise;
      }

      const targetEmails = ["pks332023@gmail.com", "putin@gmail.com"];
      const userEmail = (window._authUser && window._authUser.email) ? window._authUser.email.trim().toLowerCase() : "";
      const isTargetUser = targetEmails.includes(userEmail);

      // Check if we need to show candidate details form (adding the first college or details missing)
      if (!isTargetUser && !isDetailsFilled()) {
        state.pendingAction = {
          type: 'add-custom-college',
          college: customCollege
        };
        window.pmCloseModal();
        window.pmOpenDetailsModal();
        return;
      }

      const previousPreferences = [...state.preferences];
      state.preferences.push(customCollege);
      window.pmCloseModal();
      const success = await syncActiveListWithDB();
      if (!success) {
        state.preferences = previousPreferences;
      }
      window.renderPreferenceMakerTable();
    }
  };

  // Delete College preference from state
  window.pmDeleteCollege = async function(e, id) {
    console.log("[Antigravity Debug] pmDeleteCollege entered. e:", e, "id:", id);
    if (typeof e === 'string' && id === undefined) {
      id = e;
      console.log("[Antigravity Debug] Readjusted id from first argument:", id);
    } else if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    console.log("[Antigravity Debug] Attempting window.confirm check for id:", id);
    const confirmed = window.confirm("Are you sure you want to remove this college from your preferences?");
    console.log("[Antigravity Debug] window.confirm response:", confirmed);
    if (confirmed) {
      const previousPreferences = [...state.preferences];
      state.preferences = state.preferences.filter(item => String(item.id) !== String(id));
      
      const success = await syncActiveListWithDB();
      if (!success) {
        state.preferences = previousPreferences;
      }
      window.renderPreferenceMakerTable();
    }
  };

  // Move College preference Up in state
  window.pmMovePreferenceUp = async function(id) {
    console.log("[Antigravity Debug] pmMovePreferenceUp entered. id:", id);
    const idx = state.preferences.findIndex(p => String(p.id) === String(id));
    if (idx > 0) {
      const previousPreferences = [...state.preferences];
      const temp = state.preferences[idx];
      state.preferences[idx] = state.preferences[idx - 1];
      state.preferences[idx - 1] = temp;
      
      const success = await syncActiveListWithDB();
      if (!success) {
        state.preferences = previousPreferences;
      }
      window.renderPreferenceMakerTable();
    }
  };

  // Move College preference Down in state
  window.pmMovePreferenceDown = async function(id) {
    console.log("[Antigravity Debug] pmMovePreferenceDown entered. id:", id);
    const idx = state.preferences.findIndex(p => String(p.id) === String(id));
    if (idx !== -1 && idx < state.preferences.length - 1) {
      const previousPreferences = [...state.preferences];
      const temp = state.preferences[idx];
      state.preferences[idx] = state.preferences[idx + 1];
      state.preferences[idx + 1] = temp;
      
      const success = await syncActiveListWithDB();
      if (!success) {
        state.preferences = previousPreferences;
      }
      window.renderPreferenceMakerTable();
    }
  };

  // Reset/clear all preference items
  window.pmResetPreferences = async function() {
    const confirmed = window.confirm("Are you sure you want to clear your entire preferences list? This action cannot be undone.");
    if (confirmed) {
      const previousPreferences = [...state.preferences];
      state.preferences = [];
      
      const success = await syncActiveListWithDB();
      if (!success) {
        state.preferences = previousPreferences;
      }
      window.renderPreferenceMakerTable();
    }
  };

  // PDF download modal window controls (downloads PDF directly or requests details first)
  window.pmOpenDownloadModal = async function() {
    // 1. Verify if user is logged in
    const session = window.supabaseClient ? await window.validateSession() : null;
    const user = session ? session.user : window._authUser;
    if (!user) {
      alert("Please log in to generate and download your preference list.");
      window.navigate('login');
      return;
    }

    if (!state.preferences || state.preferences.length === 0) {
      alert("Please add at least one college to your preference list before downloading.");
      return;
    }

    // Wait for user details to load to prevent showing details form repeatedly
    if (state.userDataPromise) {
      await state.userDataPromise;
    }

    if (state.attemptsUsed >= state.maxAttempts) {
      showLimitReachedPopup();
      return;
    }

    const targetEmails = ["pks332023@gmail.com", "putin@gmail.com"];
    const userEmail = (user && user.email) ? user.email.toLowerCase() : "";
    const isTargetUser = targetEmails.includes(userEmail);

    if (isTargetUser || !isDetailsFilled()) {
      state.pendingAction = { type: 'download-pdf' };
      window.pmOpenDetailsModal();
    } else {
      await window.pmGeneratePDF();
    }
  };

  window.pmCloseDownloadModal = function() {
    document.getElementById("pmDownloadModal").style.display = "none";
  };

  // Open the Candidate Details modal and prefill if cache exists
  window.pmOpenDetailsModal = function() {
    document.getElementById("pmDownloadForm").reset();
    document.getElementById("pmDownloadModal").style.display = "flex";

    // Hide close and cancel buttons if details are not filled yet (forcing user to fill the form to proceed)
    const canClose = isDetailsFilled();
    const closeBtn = document.querySelector("#pmDownloadModal .pm-modal-close");
    const cancelBtn = document.querySelector("#pmDownloadModal .pm-btn-outline");
    if (closeBtn) closeBtn.style.display = canClose ? "block" : "none";
    if (cancelBtn) cancelBtn.style.display = canClose ? "block" : "none";

    const targetEmails = ["pks332023@gmail.com", "putin@gmail.com"];
    const userEmail = (window._authUser && window._authUser.email) ? window._authUser.email.toLowerCase() : "";
    const isTargetUser = targetEmails.includes(userEmail);

    const mobileContainer = document.getElementById("pdfMobileNum")?.closest(".pm-form-group");
    const stateContainer = document.getElementById("pdfState")?.closest(".pm-form-group");

    if (stateContainer) stateContainer.style.display = isTargetUser ? "none" : "block";
    if (mobileContainer) mobileContainer.style.display = isTargetUser ? "none" : "block";

    if (state.userDetails) {
      if (document.getElementById("pdfName")) document.getElementById("pdfName").value = state.userDetails.name || '';
      if (document.getElementById("pdfCategory")) document.getElementById("pdfCategory").value = state.userDetails.category || '';
      if (document.getElementById("pdfMobileNum")) document.getElementById("pdfMobileNum").value = state.userMobile || '';
      if (document.getElementById("pdfScore")) document.getElementById("pdfScore").value = state.userDetails.score > 0 ? state.userDetails.score : '';
      if (document.getElementById("pdfRank")) document.getElementById("pdfRank").value = state.userDetails.rank > 0 ? state.userDetails.rank : '';
      if (document.getElementById("pdfState")) document.getElementById("pdfState").value = state.userDetails.domicile !== 'N/A' ? state.userDetails.domicile : '';
      
    } else {
      if (document.getElementById("pdfMobileNum")) document.getElementById("pdfMobileNum").value = state.userMobile || '';
      if (window._authUser) {
        const nameField = document.getElementById("pdfName");
        if (nameField) {
          nameField.value = window._authUser.user_metadata?.full_name || window._authUser.user_metadata?.name || (window._authUser.email ? window._authUser.email.split('@')[0] : '') || '';
        }
      }
    }
  };

  // Handle Candidate Details form submission
  window.pmHandleDetailsSubmit = async function(e) {
    if (e && e.preventDefault) e.preventDefault();

    const targetEmails = ["pks332023@gmail.com", "putin@gmail.com"];
    const userEmail = (window._authUser && window._authUser.email) ? window._authUser.email.toLowerCase() : "";
    const isTargetUser = targetEmails.includes(userEmail);

    const name = document.getElementById("pdfName").value.trim();
    const category = document.getElementById("pdfCategory").value.trim() || 'General';
    let mobile = document.getElementById("pdfMobileNum").value.trim();
    
    if (isTargetUser && !mobile) {
      mobile = userEmail === "pks332023@gmail.com" ? "9999999901" : "9999999902";
      const mobileField = document.getElementById("pdfMobileNum");
      if (mobileField) mobileField.value = mobile;
    }
    
    const score = Number(document.getElementById("pdfScore").value) || 0;
    const rank = Number(document.getElementById("pdfRank").value) || 0;
    const domicile = document.getElementById("pdfState").value.trim() || 'N/A';
    const course = 'MBBS'; // Default course since field is removed

    const submitBtn = document.querySelector('#pmDownloadForm button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerText : "Save & Continue";

    if (!isTargetUser && !/^[0-9]{10}$/.test(mobile)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = "Saving...";
    }

    if (isTargetUser) {
      state.userDetails = {
        name: name,
        email: window._authUser.email,
        category: category,
        score: score,
        rank: rank,
        domicile: domicile,
        course: course
      };
      saveUserDetailsToCache();
      window.pmCloseDownloadModal();
      if (state.pendingAction && state.pendingAction.type === 'download-pdf') {
        state.pendingAction = null;
        await window.pmGeneratePDF();
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = originalBtnText;
      }
      return;
    }

    try {
      if (window.supabaseClient) {
        // Upsert users table first
        const { error: userError } = await window.supabaseClient
          .from('users')
          .upsert({
            id: window._authUser.id,
            mobile_number: mobile,
            email: window._authUser.email,
            name: name
          }, { onConflict: 'id' });

        if (userError) throw userError;

        state.userMobile = mobile;

        // Check if user already exists in preference_maker_users by email
        const { data: existingUser, error: checkErr } = await window.supabaseClient
          .from('preference_maker_users')
          .select('*')
          .eq('email', window._authUser.email)
          .maybeSingle();

        if (checkErr) throw checkErr;

        const detailsData = {
          mobile: mobile,
          name: name,
          category: category,
          score: score,
          rank: rank,
          domicile: domicile,
          course: course,
          email: window._authUser.email,
          updated_at: new Date().toISOString()
        };

        if (!existingUser) {
          // If user does not exist: Create new record
          const { error: insertErr } = await window.supabaseClient
            .from('preference_maker_users')
            .insert({
              ...detailsData,
              attempts_used: 0,
              max_attempts: 1,
              plan_type: 'free',
              payment_status: 'unpaid',
              lists_remaining: 0
            });
          
          if (insertErr) throw insertErr;
        } else {
          // If user exists: update details
          const { error: updateErr } = await window.supabaseClient
            .from('preference_maker_users')
            .update({
              name: name,
              category: category,
              mobile: mobile,
              score: score,
              rank: rank,
              domicile: domicile,
              course: course,
              email: window._authUser.email,
              updated_at: new Date().toISOString()
            })
            .eq('email', window._authUser.email);
          
          if (updateErr) throw updateErr;
        }

        if (window._authUser && window._authUser.email) {
          localStorage.setItem('pm_form_submitted_' + window._authUser.email.toLowerCase(), 'true');
        }

        const currentPreferences = [...(state.preferences || [])];
        await loadUserPreferenceMakerData();
        if (currentPreferences.length > 0) {
          state.preferences = currentPreferences;
          await syncActiveListWithDB();
        }
      } else {
        state.userMobile = mobile;
      }

      // Update state details cache
      state.userDetails = {
        name: name,
        email: window._authUser.email,
        category: category,
        score: score,
        rank: rank,
        domicile: domicile,
        course: course
      };

      saveUserDetailsToCache();

      // Close details modal
      window.pmCloseDownloadModal();

      // Handle pending actions
      if (state.pendingAction) {
        const action = state.pendingAction;
        state.pendingAction = null;

        if (action.type === 'add-college') {
          const college = action.college;
          const alreadyExists = state.preferences.some(item => String(item.id) === String(college.id));
          if (!alreadyExists) {
            const previousPreferences = [...state.preferences];
            state.preferences.push({
              id: college.id,
              name: college.name,
              state: college.state,
              fees: college.fees,
              bond: college.bond
            });
            const success = await syncActiveListWithDB();
            if (!success) {
              state.preferences = previousPreferences;
            }
          }
          window.renderPreferenceMakerTable();
        } else if (action.type === 'add-custom-college') {
          const college = action.college;
          const previousPreferences = [...state.preferences];
          state.preferences.push(college);
          const success = await syncActiveListWithDB();
          if (!success) {
            state.preferences = previousPreferences;
          }
          window.renderPreferenceMakerTable();
        } else if (action.type === 'download-pdf') {
          await window.pmGeneratePDF();
        }
      }
    } catch (err) {
      console.error("Error saving candidate details:", err);
      if (err.message && err.message.includes("uq_preference_maker_users_mobile")) {
        alert("This mobile number is already in use by another account. Please use a different mobile number.");
      } else {
        alert("Failed to save candidate details: " + err.message);
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = originalBtnText;
      }
    }
  };

  // PDF report builder and download generator using jsPDF & AutoTable
  window.pmGeneratePDF = async function(e) {
    if (e && e.preventDefault) e.preventDefault();

    // 1. Verify if user is logged in
    const session = window.supabaseClient ? await window.validateSession() : null;
    const user = session ? session.user : window._authUser;
    if (!user) {
      alert("Please log in to generate and download your preference list.");
      window.navigate('login');
      return;
    }
    const email = user.email;

    // Wait for user details to load to prevent showing details form repeatedly
    if (state.userDataPromise) {
      await state.userDataPromise;
    }

    const detailsFilled = isDetailsFilled();
    const name = detailsFilled ? state.userDetails.name : (user.user_metadata?.full_name || user.user_metadata?.name || 'Student');
    const category = detailsFilled ? state.userDetails.category : 'General';
    const score = detailsFilled ? state.userDetails.score : 0;
    const rank = detailsFilled ? state.userDetails.rank : 0;
    const domicile = detailsFilled ? state.userDetails.domicile : 'N/A';
    const course = detailsFilled ? state.userDetails.course : 'MBBS';

    const downloadBtn = document.querySelector('[onclick="window.pmOpenDownloadModal()"]');
    const originalBtnText = downloadBtn ? downloadBtn.innerHTML : "Download PDF";
    if (downloadBtn) {
      downloadBtn.disabled = true;
      downloadBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Generating...`;
    }

    let allowGeneration = false;

    const targetEmailsPdf = ["pks332023@gmail.com", "putin@gmail.com"];
    const userEmailPdf = (user && user.email) ? user.email.trim().toLowerCase() : "";
    const isTargetUserPdf = targetEmailsPdf.includes(userEmailPdf);

    // Verify and track attempts in Supabase database
    try {
      if (isTargetUserPdf) {
        allowGeneration = true;
      } else if (window.supabaseClient) {
        console.log("[Preference Maker] Verifying attempts with database...");
        
        // 1. Fetch user by email/mobile
        const { data: userRecord, error: fetchErr } = await window.supabaseClient
            .from('preference_maker_users')
            .select('*')
            .eq('email', state.userDetails.email || window._authUser.email)
          .maybeSingle();

        if (fetchErr) {
          throw new Error("Attempts verification failed: " + fetchErr.message);
        }

        if (!userRecord) {
          // Fallback registration (should already exist)
          const { error: insertErr } = await window.supabaseClient
            .from('preference_maker_users')
            .insert({
              name: name,
              email: email,
              mobile: state.userMobile,
              category: category,
              score: Number(score),
              rank: Number(rank),
              domicile: domicile,
              course: course,
              attempts_used: 1,
              max_attempts: 1,
              plan_type: 'free',
              payment_status: 'unpaid',
              lists_remaining: 0
            });
          
          if (insertErr) {
            console.warn("Failed to register user attempts in DB. Allowing local generation:", insertErr.message);
          }
          state.attemptsUsed = 1;
          state.maxAttempts = 1;
          updateListSelectorUI();
          allowGeneration = true;
        } else {
          // Existing User
          const maxAtt = userRecord.max_attempts != null ? userRecord.max_attempts : 1;
          if (userRecord.attempts_used >= maxAtt) {
            showLimitReachedPopup();
            return;
          } else {
            // increment attempts
            const { error: updateErr } = await window.supabaseClient
              .from('preference_maker_users')
              .update({
                attempts_used: userRecord.attempts_used + 1
              })
              .eq('id', userRecord.id);

            if (updateErr) {
              console.warn("Failed to update attempts in DB due to security. Proceeding with generation:", updateErr.message);
            }
            state.attemptsUsed = userRecord.attempts_used + 1;
            state.maxAttempts = maxAtt;
            updateListSelectorUI();
            allowGeneration = true;
          }
        }
      } else {
        allowGeneration = true;
      }
    } catch (dbErr) {
      console.error("Database validation error:", dbErr);
      alert("Verification Error: " + dbErr.message);
      return;
    } finally {
      if (downloadBtn && !allowGeneration) {
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = originalBtnText;
      }
    }

    if (!allowGeneration) return;

    try {
      if (!window.jspdf || !window.jspdf.jsPDF) {
        throw new Error("jsPDF library is not loaded. Please wait a moment and try again.");
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');
      
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      // Load logo image and convert to PNG data URL for watermark
      let logoDataUrl = null;
      try {
        logoDataUrl = await new Promise((resolve) => {
          const img = new Image();
          img.src = 'assets/logo.webp';
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL('image/png'));
            } catch (err) {
              console.error("[Preference Maker] Canvas draw error:", err);
              resolve(null);
            }
          };
          img.onerror = () => resolve(null);
        });
      } catch (e) {
        console.error("[Preference Maker] Failed to load watermark logo image:", e);
      }

      // Premium Color Palette
      const purplePrimary = [45, 11, 82]; // #2D0B52
      const purpleAccent = [123, 47, 247]; // #7B2FF7
      const goldAccent = [255, 195, 0]; // #FFC300
      const textDark = [33, 37, 41]; // #212529
      const textMuted = [108, 117, 125]; // #6C757D
      const lightBg = [248, 249, 250]; // #F8F9FA
      const borderGray = [222, 226, 230]; // #DEE2E6

      let y = 15;

      // 1. Header Banner
      doc.setFillColor(...purplePrimary);
      doc.rect(0, 0, pageWidth, 35, 'F');

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text("NEET UG PREFERENCE LIST", 15, 18);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...goldAccent);
      doc.text("Generated by NEET Counselling Preference Maker", 15, 24);

      doc.setFontSize(9);
      doc.setTextColor(201, 182, 228);
      const today = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Generated: ${today}`, pageWidth - 15, 18, { align: 'right' });

      // 2. Candidate Information Card
      y = 48;
      doc.setFillColor(...lightBg);
      doc.setDrawColor(...borderGray);
      doc.rect(15, y, pageWidth - 30, 38, 'FD');

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...purpleAccent);
      doc.text("CANDIDATE INFORMATION", 20, y + 7);
      
      doc.setFontSize(9);
      
      // Column 1
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(...textMuted);
      doc.text("Candidate Name:", 20, y + 16);
      doc.setTextColor(...textDark);
      doc.setFont("Helvetica", "bold");
      doc.text(name, 50, y + 16);

      doc.setFont("Helvetica", "normal");
      doc.setTextColor(...textMuted);
      doc.text("Preferred Course:", 20, y + 23);
      doc.setTextColor(...textDark);
      doc.setFont("Helvetica", "bold");
      doc.text(course, 50, y + 23);

      doc.setFont("Helvetica", "normal");
      doc.setTextColor(...textMuted);
      doc.text("Domicile State:", 20, y + 30);
      doc.setTextColor(...textDark);
      doc.setFont("Helvetica", "bold");
      doc.text(domicile, 50, y + 30);

      // Column 2
      const col2Left = 110;
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(...textMuted);
      doc.text("All India Rank (AIR):", col2Left, y + 16);
      doc.setTextColor(...textDark);
      doc.setFont("Helvetica", "bold");
      doc.text(Number(rank).toLocaleString('en-IN'), col2Left + 35, y + 16);

      doc.setFont("Helvetica", "normal");
      doc.setTextColor(...textMuted);
      doc.text("NEET Score:", col2Left, y + 23);
      doc.setTextColor(...textDark);
      doc.setFont("Helvetica", "bold");
      doc.text(`${score} / 720`, col2Left + 35, y + 23);

      doc.setFont("Helvetica", "normal");
      doc.setTextColor(...textMuted);
      doc.text("Category:", col2Left, y + 30);
      doc.setTextColor(...textDark);
      doc.setFont("Helvetica", "bold");
      doc.text(category, col2Left + 35, y + 30);

      // 3. Preferences Table
      y = 96;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...purplePrimary);
      doc.text("SAVED COLLEGE PREFERENCE ORDER", 15, y);

      const tableRows = state.preferences.map((item, index) => [
        String(index + 1),
        item.name,
        item.state,
        item.fees === 0 ? '-' : `Rs. ${Number(item.fees).toLocaleString('en-IN')}`,
        (item.bond ? item.bond.replace(/₹/g, 'Rs. ') : 'N/A')
      ]);

      doc.autoTable({
        startY: y + 4,
        head: [['#', 'College Name', 'State', 'Annual Fees', 'Bond & Service Details']],
        body: tableRows,
        theme: 'striped',
        headStyles: {
          fillColor: purplePrimary,
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'left',
          valign: 'middle'
        },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 70 },
          2: { cellWidth: 27 },
          3: { cellWidth: 28 },
          4: { cellWidth: 40 }
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
          textColor: textDark,
          lineColor: borderGray,
          lineWidth: 0.1
        },
        alternateRowStyles: {
          fillColor: [252, 248, 255] // light violet/purple tint
        },
        margin: { left: 15, right: 15 },
        didDrawPage: function(data) {
          // Draw watermark
          if (logoDataUrl) {
            try {
              doc.saveGraphicsState();
              const gState = new doc.GState({ opacity: 0.10 });
              doc.setGState(gState);
              
              const wSize = 130; // 130mm width
              const hSize = 130; // 130mm height
              const xVal = (pageWidth - wSize) / 2;
              const yVal = (pageHeight - hSize) / 2;
              
              doc.addImage(logoDataUrl, 'PNG', xVal, yVal, wSize, hSize);
              doc.restoreGraphicsState();
            } catch (err) {
              console.error("[Preference Maker] Error drawing watermark logo:", err);
            }
          }

          doc.setFont("Helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(...textMuted);
          doc.text("DC NEET COUNSELLING - 9694673555, 8000258339", 15, pageHeight - 10);
          
          const pageNum = doc.internal.getNumberOfPages();
          doc.text(`Page ${data.pageNumber} of ${pageNum}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
        }
      });

      const filename = `${name.replace(/\s+/g, '_')}_NEET_Preferences.pdf`;
      doc.save(filename);
      window.pmCloseDownloadModal();
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("Error generating PDF: " + err.message);
    } finally {
      if (downloadBtn) {
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = originalBtnText;
      }
    }
  };

  // Native Drag and Drop Sorting Engine
  let draggedRow = null;

  function initDragAndDrop() {
    if (state.viewMode !== "preferences") return;
    const tableBody = document.getElementById("pmTableBody");
    if (!tableBody) return;

    const rows = tableBody.querySelectorAll("tr[data-id]");

    rows.forEach(row => {
      const handle = row.querySelector('.pm-drag-handle');
      if (handle) {
        // DragStart Event on the handle itself
        handle.addEventListener("dragstart", function(e) {
          draggedRow = row;
          row.classList.add("pm-row-dragging");
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", row.getAttribute("data-id"));
          
          // Set the whole row as the visual drag image
          if (e.dataTransfer.setDragImage) {
            e.dataTransfer.setDragImage(row, 20, 20);
          }
        });

        // DragEnd Event on the handle itself
        handle.addEventListener("dragend", function() {
          row.classList.remove("pm-row-dragging");
          // Clear all dragover indicator classes
          rows.forEach(r => r.classList.remove("pm-row-over"));
          draggedRow = null;
        });
      }

      // DragOver Event
      row.addEventListener("dragover", function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (row !== draggedRow) {
          row.classList.add("pm-row-over");
        }
      });

      // DragLeave Event
      row.addEventListener("dragleave", function() {
        row.classList.remove("pm-row-over");
      });

      // Drop Event
      row.addEventListener("drop", async function(e) {
        e.preventDefault();
        row.classList.remove("pm-row-over");

        if (draggedRow && row !== draggedRow) {
          const draggedId = draggedRow.getAttribute("data-id");
          const targetId = row.getAttribute("data-id");

          const draggedIdx = state.preferences.findIndex(p => String(p.id) === String(draggedId));
          const targetIdx = state.preferences.findIndex(p => String(p.id) === String(targetId));

          if (draggedIdx !== -1 && targetIdx !== -1) {
            const previousPreferences = [...state.preferences];
            // Swap items or re-insert item into the array
            const [removed] = state.preferences.splice(draggedIdx, 1);
            state.preferences.splice(targetIdx, 0, removed);

            const success = await syncActiveListWithDB();
            if (!success) {
              state.preferences = previousPreferences;
            }

            // Re-render table with updated preference state
            window.renderPreferenceMakerTable();
          }
        }
      });
    });
  }

})();

