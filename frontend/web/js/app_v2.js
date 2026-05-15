
window.processReferralSignup = async function(user, email, fullName) {
    if (!user || !user.id) return;
    try {
        console.log('[Referral] Processing referral for user:', user.id);
        var newToken = Math.random().toString(36).substring(2, 11).toLowerCase();
        var pendingRef = localStorage.getItem('referral_code');
        var refId = null;
        
        if (pendingRef) {
            console.log('REFERRAL LINK FOUND:', pendingRef);
            var { data: refData } = await window.supabaseClient
                .from('users')
                .select('id')
                .eq('referral_token', pendingRef)
                .maybeSingle();
            
            if (refData && refData.id && refData.id !== user.id) {
                refId = refData.id;
                console.log('REFERRER FOUND:', refId);
            }
        }
        
        var payload = { referral_token: newToken };
        if (refId) payload.referred_by = refId;
        
        await window.supabaseClient.from('users').update(payload).eq('id', user.id);
        
        if (refId) {
            // Prevent duplicate tracking
            var { data: existingRef } = await window.supabaseClient
                .from('referrals')
                .select('id')
                .eq('referred_user_id', user.id)
                .maybeSingle();

            if (!existingRef) {
                var { data: referrerInfo } = await window.supabaseClient
                    .from('users')
                    .select('email, full_name, name')
                    .eq('id', refId)
                    .single();

                const { data: insertedRef } = await window.supabaseClient.from('referrals').insert({
                    referrer_id: refId,
                    referred_user_id: user.id,
                    referrer_email: referrerInfo?.email || null,
                    referrer_name: referrerInfo?.full_name || referrerInfo?.name || null,
                    referred_user_email: email,
                    referred_user_name: fullName || null,
                    referral_token: pendingRef,
                    status: 'joined'
                }).select('id').single();
                console.log('TRACKING RECORD INSERTED');
                
                if (insertedRef && insertedRef.id) {
                    const welcomeCode = 'WELCOME-' + Math.random().toString(36).substring(2, 6).toUpperCase();
                    const expiryDate = new Date();
                    expiryDate.setDate(expiryDate.getDate() + 15);
                    
                    await window.supabaseClient.from('referral_coupons').insert({
                        code: welcomeCode,
                        user_id: user.id,
                        discount_percent: 10,
                        referral_id: insertedRef.id,
                        referrer_name: referrerInfo?.full_name || referrerInfo?.name || 'Unknown',
                        referrer_email: referrerInfo?.email || 'N/A',
                        referred_user_name: fullName || 'New User',
                        referred_user_email: email,
                        expires_at: expiryDate.toISOString()
                    });
                    console.log('[Referral] Coupon generated.');
                }
                
                localStorage.removeItem('referral_code');
            }
        }
    } catch(refErr) { console.error('[Referral] Setup error:', refErr); }
};

// ─── Referral Detection ────────────────────────────────────────────────────────
(function() {
    const urlParams = new URLSearchParams(window.location.search);
    let refToken = urlParams.get('ref');
    
    // Also check hash for SPA links like dc.com/#signup?ref=...
    if (!refToken && window.location.hash.includes('ref=')) {
        const hashStr = window.location.hash;
        const refMatch = hashStr.match(/[#?&]ref=([^&]+)/);
        if (refMatch && refMatch[1]) {
            refToken = refMatch[1];
        }
    }

    if (refToken) {
        console.log('[Referral] Token detected:', refToken);
        localStorage.setItem('referral_code', refToken);
    }
})();

// ─── GoAffPro Dynamic Loader ────────────────────────────────────────────────
window.loadGoAffPro = function() {
    if (window.goaffpro) return;

    const script = document.createElement("script");
    script.src = "https://api.goaffpro.com/loader.js";
    script.async = true;

    script.onload = () => {
        console.log("GoAffPro Loaded Successfully");
    };

    script.onerror = () => {
        console.error("GoAffPro Failed to Load");
    };

    document.body.appendChild(script);
};
window.loadGoAffPro();
// ──────────────────────────────────────────────────────────────────────────────

// ─── Supabase Configuration ───────────────────────────────────────────────────
const SUPABASE_URL  = window.__SUPABASE_URL || 'https://rlqmdylbzapyepuwncwt.supabase.co';
const SUPABASE_ANON = window.__SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscW1keWxiemFweWVwdXduY3d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNTcwNzYsImV4cCI6MjA5MTgzMzA3Nn0.oNNK1pwLnykQlNfUkw7IdB-ZBkKDoWxszsKDSIjsLeo';

const COUNSELLING_META = {
    'med_basic': { title: 'Medical - Basic Plan', price: 4999, type: 'Medical' },
    'med_gold': { title: 'Medical - Gold Plan', price: 9999, type: 'Medical' },
    'med_platinum': { title: 'Medical - Private MBBS/BDS', price: 14999, type: 'Medical' },
    'ayush_basic': { title: 'AYUSH - Basic Plan', price: 4999, type: 'AYUSH' },
    'ayush_gold': { title: 'AYUSH - Gold Plan', price: 8999, type: 'AYUSH' },
    'ayush_platinum': { title: 'AYUSH - Private Plan', price: 9999, type: 'AYUSH' },
    'vet_basic': { title: 'Veterinary - Basic Plan', price: 4999, type: 'Veterinary' },
    'vet_gold': { title: 'Veterinary - Gold Plan', price: 8999, type: 'Veterinary' },
    'vet_platinum': { title: 'Veterinary - Premium Plan', price: 9999, type: 'Veterinary' },
    'combo_basic': { title: 'Combo - Basic Plan', price: 5999, type: 'Combo' },
    'combo_gold': { title: 'Combo - Gold Plan', price: 14999, type: 'Combo' },
    'combo_platinum': { title: 'Combo - Premium Plan', price: 14999, type: 'Combo' }
};


const REDIRECT_URL = window.location.href.split('#')[0].split('?')[0];

// ─── Security Utilities ──────────────────────────────────────────────────────

/**
 * XSS Sanitizer — escapes HTML entities in user-supplied strings
 * Use this before inserting any user data into innerHTML.
 */
window.sanitizeHTML = function(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
};

/**
 * Login Rate Limiter — prevents brute force attacks client-side.
 * Allows max 5 attempts within a 5-minute window.
 */
var _loginAttempts = [];
var LOGIN_MAX_ATTEMPTS = 5;
var LOGIN_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

function isLoginRateLimited() {
    var now = Date.now();
    // Purge old attempts outside the window
    _loginAttempts = _loginAttempts.filter(function(t) { return now - t < LOGIN_WINDOW_MS; });
    return _loginAttempts.length >= LOGIN_MAX_ATTEMPTS;
}

function recordLoginAttempt() {
    _loginAttempts.push(Date.now());
}

function getLoginLockoutRemaining() {
    if (_loginAttempts.length === 0) return 0;
    var oldest = _loginAttempts[0];
    var remaining = LOGIN_WINDOW_MS - (Date.now() - oldest);
    return Math.max(0, Math.ceil(remaining / 1000));
}

/**
 * Password validator
 * Restrictions removed as per user request.
 */
function validatePasswordStrength(pass) {
    return null; // All passwords pass
}

// ─── Nav Active State Helper ─────────────────────────────────────────────────
window.setNavActive = function(route) {
    // Desktop pill nav
    document.querySelectorAll('.nav-pill-link').forEach(function(link) {
        if (link.getAttribute('data-route') === route) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    // Mobile drawer links
    document.querySelectorAll('.md-link[data-route]').forEach(function(link) {
        if (link.getAttribute('data-route') === route) {
            link.classList.add('highlight');
        } else {
            link.classList.remove('highlight');
        }
    });
};

// ─── Core Router (Upgraded) ──────────────────────────────────────────────────

// ─── GoAffPro Tracking Utilities ──────────────────────────────────────────────
window.refreshGoAffPro = function() {
    if (window.goaffpro && window.goaffpro.refetch) {
        window.goaffpro.refetch();
        console.log('GoAffPro refetched');
    }
};

window.trackGoAffProOrder = function(order) {
    const backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'https://rlqmdylbzapyepuwncwt.supabase.co/functions/v1' 
        : 'https://rlqmdylbzapyepuwncwt.supabase.co/functions/v1';
    console.log('Calling API URL:', `${backendUrl}/track-order`);
    fetch(`${backendUrl}/track-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            order_id: order.id,
            total: order.amount,
            coupon: order.coupon || ''
        })
    }).catch(e => console.error("GoAffPro server track error:", e));
};

window.addEventListener('load', function() {
    setTimeout(() => {
        console.log('GoAffPro status:', typeof goaffpro);
    }, 2000);
});
// ──────────────────────────────────────────────────────────────────────────────

// Enhance the stub navigation with animations and dynamic features
var originalStub = window.navigate;
window.navigate = function(route) {
    if (route === 'ebooks') {
        setTimeout(function() { if (window.loadWishlistStates) window.loadWishlistStates(); }, 200);
        setTimeout(function() { if (window.loadCartStates) window.loadCartStates(); }, 250);
    }
    if (route === 'cart') {
        setTimeout(function() { if (window.renderCartPage) window.renderCartPage(); }, 200);
    }
    if (route === 'wishlist') {
        setTimeout(function() { if (window.renderWishlistPage) window.renderWishlistPage(); }, 200);
    }
    if (route === 'orders') {
        var ordersEl = document.getElementById('section-orders');
        if (ordersEl) {
            ordersEl.style.display = 'block';
            ordersEl.innerHTML = '<div style="padding:120px 20px;text-align:center;"><div class="loading-spinner"></div><br>Loading your order history...</div>';
            renderOrders().then(html => {
                if (html) ordersEl.innerHTML = html;
            }).catch(err => {
                ordersEl.innerHTML = '<div style="padding:120px 20px;text-align:center;color:#ef4444;">Failed to load orders. Please refresh.</div>';
            });
        }
    }
    if (route === 'wallet') {
        var walletEl = document.getElementById('section-wallet');
        if (walletEl) {
            walletEl.style.display = 'block';
            walletEl.innerHTML = '<div style="padding:120px 20px;text-align:center;"><div class="loading-spinner"></div><br>Loading your wallet...</div>';
            renderWallet().then(html => {
                if (html) walletEl.innerHTML = html;
            }).catch(err => {
                walletEl.innerHTML = '<div style="padding:120px 20px;text-align:center;color:#ef4444;">Failed to load wallet. Please refresh.</div>';
            });
        }
    }
    if (route === 'dashboard') {
        var dashEl = document.getElementById('section-dashboard');
        if (dashEl) {
            dashEl.style.display = 'block';
            dashEl.innerHTML = '<div style="padding:120px 20px;text-align:center;"><div class="loading-spinner"></div><br>Loading your dashboard...</div>';
            renderDashboard().then(html => {
                if (html) dashEl.innerHTML = html;
            }).catch(err => {
                dashEl.innerHTML = '<div style="padding:120px 20px;text-align:center;color:#ef4444;">Failed to load dashboard. Please refresh.</div>';
            });
        }
    }
    
    if (originalStub && originalStub !== window.navigate) {
        originalStub(route);
    }

    // Update active nav highlight for desktop + mobile
    window.setNavActive(route);

    // Re-run animations after section switch
    setTimeout(function() {
        if (typeof initAnimations === 'function') initAnimations();
        if (typeof bindDynamicEvents === 'function') bindDynamicEvents();
    }, 50);

    setTimeout(function() {
        if (window.refreshGoAffPro) window.refreshGoAffPro();
        if (window.loadGoAffPro) window.loadGoAffPro();
    }, 1000);
};



// ─── App Boot ─────────────────────────────────────────────────────────────────
window.bootApp = bootApp; // EXPOSE IMMEDIATELY
function bootApp() {

    document.body.classList.add('js-enabled');

    // ══════════════════════════════════════════════════════════════════════
    // BULLETPROOF SUPABASE INIT + SESSION PERSISTENCE
    // ══════════════════════════════════════════════════════════════════════
    // ══════════════════════════════════════════════════════════════════════
    // SUPABASE AUTH INITIALIZATION (Single Source of Truth)
    // ══════════════════════════════════════════════════════════════════════
    (function syncAuthState() {
        if (!window.supabaseClient) {
            setTimeout(syncAuthState, 100);
            return;
        }

        // Use onAuthStateChange as SINGLE SOURCE OF TRUTH
        window.supabaseClient.auth.onAuthStateChange(function(event, session) {

            if (window.updateNavForAuth) {
                window.updateNavForAuth(session);
            }
            
            // Ensure dashboard catches the loaded user session if we refreshed while on the dashboard
            if (window.location.hash === '#dashboard') {
                var dashEl = document.getElementById('section-dashboard');
                if (dashEl && typeof renderDashboard === 'function') {
                    dashEl.style.display = 'block';
                    renderDashboard().then(function(html) {
                        if (html) dashEl.innerHTML = html;
                    });
                }
            }

            // REFERRAL SYSTEM: Auto-link on first login/signup if pending referral exists
            // Uses a synchronous global lock to prevent duplicate inserts from concurrent SIGNED_IN events
            if (event === 'SIGNED_IN' && session && session.user) {
                (async function() {
                    // ── SYNCHRONOUS LOCK: Prevents ANY concurrent execution ──
                    // This variable is checked synchronously so even two events in the same tick are blocked
                    if (window.__referralProcessing) {
                        console.log('[Referral] Already processing, skipping duplicate event.');
                        return;
                    }
                    window.__referralProcessing = true;
                    
                    try {
                        const pendingRef = localStorage.getItem('referral_code');
                        let user = null;
                        
                        // Retry fetching user up to 4 times (wait for DB trigger)
                        for (let i = 0; i < 4; i++) {
                            const { data } = await window.supabaseClient.from('users').select('referred_by, referral_token').eq('id', session.user.id).single();
                            if (data) { user = data; break; }
                            await new Promise(r => setTimeout(r, 1000));
                        }
                        
                        if (user && !user.referred_by && pendingRef) {
                            console.log('[Referral] Linking user to referrer:', pendingRef);
                            const { data: refUser } = await window.supabaseClient.from('users').select('id, full_name, name, email').eq('referral_token', pendingRef).maybeSingle();
                            
                            if (refUser && refUser.id !== session.user.id) {
                                await window.supabaseClient.from('users').update({ referred_by: refUser.id }).eq('id', session.user.id);
                                
                                // Check for existing referral AGAIN right before insert (final gate)
                                const { data: existingRef } = await window.supabaseClient.from('referrals').select('id').eq('referred_user_id', session.user.id).maybeSingle();
                                let referralId = existingRef ? existingRef.id : null;
                                
                                if (!existingRef) {
                                    const { data: newRef, error: insertErr } = await window.supabaseClient.from('referrals').insert({
                                        referrer_id: refUser.id,
                                        referred_user_id: session.user.id,
                                        referrer_name: refUser.full_name || refUser.name || 'Unknown',
                                        referrer_email: refUser.email || 'N/A',
                                        referred_user_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'New User',
                                        referred_user_email: session.user.email,
                                        referral_token: pendingRef,
                                        status: 'joined'
                                    }).select('id').single();
                                    
                                    if (insertErr) {
                                        console.warn('[Referral] Insert error (likely duplicate):', insertErr.message);
                                        // If insert failed due to duplicate, fetch existing
                                        const { data: fallback } = await window.supabaseClient.from('referrals').select('id').eq('referred_user_id', session.user.id).maybeSingle();
                                        if (fallback) referralId = fallback.id;
                                    } else if (newRef) {
                                        referralId = newRef.id;
                                    }
                                }
                                
                                // Generate a Welcome Coupon ONLY if none exists yet
                                if (referralId) {
                                    const { data: existingCoupon } = await window.supabaseClient.from('referral_coupons').select('id').eq('user_id', session.user.id).maybeSingle();
                                    
                                    if (!existingCoupon) {
                                        const welcomeCode = 'WELCOME-' + Math.random().toString(36).substring(2, 6).toUpperCase();
                                        const expiryDate = new Date();
                                        expiryDate.setDate(expiryDate.getDate() + 15);
                                        
                                        await window.supabaseClient.from('referral_coupons').insert({
                                            code: welcomeCode,
                                            user_id: session.user.id,
                                            discount_percent: 10,
                                            referral_id: referralId,
                                            referrer_name: refUser.full_name || refUser.name || 'Unknown',
                                            referrer_email: refUser.email || 'N/A',
                                            referred_user_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'New User',
                                            referred_user_email: session.user.email,
                                            expires_at: expiryDate.toISOString()
                                        });
                                        console.log('[Referral] Coupon generated.');
                                    }
                                }
                                localStorage.removeItem('referral_code');
                                console.log('[Referral] Successfully linked.');
                                
                                // Refresh the referral UI if the user is on the dashboard
                                if (typeof window.loadReferralPageData === 'function') {
                                    window.loadReferralPageData();
                                }
                            }
                        }
                        
                        // Generate token if missing
                        if (user && !user.referral_token) {
                            const newToken = session.user.id.replace(/-/g, '').substring(0, 9).toLowerCase();
                            await window.supabaseClient.from('users').update({ referral_token: newToken }).eq('id', session.user.id);
                        }
                    } catch(err) {
                        console.error('[Referral] Error:', err);
                    } finally {
                        // Release the lock after a delay to prevent re-entry from subsequent events
                        setTimeout(function() { window.__referralProcessing = false; }, 5000);
                    }
                })();
            }
        });


    })();


    // Wire up ALL [data-route] elements (links and buttons)
    document.querySelectorAll('[data-route]').forEach(function(el) {
        el.addEventListener('click', function(e) {
            e.preventDefault();
            var route = el.getAttribute('data-route');
            if (route) window.navigate(route);
        });
    });

    // Initial navigation
    var rawHash = window.location.hash;
    if (rawHash.includes('error=')) {
        var errStr = decodeURIComponent((rawHash.split('error_description=')[1] || '').split('&')[0] || rawHash);
        if (errStr.toLowerCase().includes('expire') || errStr.toLowerCase().includes('invalid')) {
            window.location.replace('/reset-password/' + window.location.hash);
        } else {
            setTimeout(() => {
                alert('Supabase Auth Error: ' + errStr);
            }, 800);
            window.navigate('login');
        }
    } else if (rawHash.includes('access_token=')) {
        // Only redirect to home if NOT a password recovery flow
        if (!rawHash.includes('type=recovery')) {
            setTimeout(() => window.navigate('home'), 1500);
        } else {
            console.log("[App] Recovery link detected, navigating to separate reset-password page.");
            window.location.replace('/reset-password/' + window.location.hash);
        }
    } else {
        window.navigate(rawHash.replace('#', '') || 'home');
    }

    // Additional setup
    initMouseEffects();
    try { setupLoginPage(); } catch(e) { console.warn('setupLoginPage:', e); }
    try { setupPredictorModal(); } catch(e) { console.warn('setupPredictorModal:', e); }
    initAnimations();

    // Expose globals
    window.signInWithGoogle = signInWithGoogle;
    window.simulatePrediction = simulatePrediction;
    window.resetPredictor = resetPredictor;
}

// ─── Dynamic Event Binding ────────────────────────────────────────────────────
function bindDynamicEvents() {
    var heroBtn = document.getElementById('heroPredictorBtn');
    if (heroBtn && !heroBtn._bound) {
        heroBtn._bound = true;
        heroBtn.addEventListener('click', function() {
            document.getElementById('predictorModal').style.display = 'block';
            document.getElementById('modalOverlay').style.display = 'block';
        });
    }
}

// ─── Animations ───────────────────────────────────────────────────────────────
function initAnimations() {
    var fadeUpEls = document.querySelectorAll('.fade-up, .stagger-in');
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05 });

    fadeUpEls.forEach(function(el) {
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            el.classList.add('visible');
        } else if (!el.classList.contains('visible')) {
            observer.observe(el);
        }
    });


    // Small delay to ensure browser has completed initial layout
    setTimeout(function() {
        initCounters();
        // initTiltEffects(); // Disabled as per user request to keep cards static
        initCarousel();
    }, 150);
}

function initCarousel() {
    var track = document.getElementById('newsCarouselTrack');
    var leftBtn = document.getElementById('newsCarouselLeft');
    var rightBtn = document.getElementById('newsCarouselRight');
    if (!track) return;
    
    if (track._carouselInit) return;
    track._carouselInit = true;

    var scrollAmt = 300; 

    if (leftBtn) {
        leftBtn.addEventListener('click', function() { 
            if (track.scrollLeft <= 0) {
                track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
            } else {
                track.scrollBy({ left: -scrollAmt, behavior: 'smooth' }); 
            }
        });
    }

    var scrollRight = function() {
        if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
            track.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            track.scrollBy({ left: scrollAmt, behavior: 'smooth' });
        }
    };

    if (rightBtn) {
        rightBtn.addEventListener('click', scrollRight);
    }

    // Interval logic: 2500ms
    if (window._newsCarouselInterval) clearInterval(window._newsCarouselInterval);
    window._newsCarouselInterval = setInterval(scrollRight, 2500);

    // Pause on Hover
    var wrapper = document.querySelector('.carousel-wrapper');
    if (wrapper) {
        wrapper.addEventListener('mouseenter', function() { clearInterval(window._newsCarouselInterval); });
        wrapper.addEventListener('mouseleave', function() {
            clearInterval(window._newsCarouselInterval);
            window._newsCarouselInterval = setInterval(scrollRight, 2500);
        });
    }
}

function initMouseEffects() {
    var glow = document.getElementById('cursor-glow');
    if (!glow) return;
    document.addEventListener('mousemove', function(e) {
        glow.style.opacity = '1';
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });
    document.addEventListener('mouseleave', function() { glow.style.opacity = '0'; });
}

function initTiltEffects() {
    var cards = document.querySelectorAll('.glass-panel:not(#predictorModal)');
    cards.forEach(function(card) {
        card.addEventListener('mousemove', function(e) {
            var rect = card.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            var cx = rect.width / 2;
            var cy = rect.height / 2;
            card.style.transform = 'perspective(1000px) rotateX(' + ((y - cy) / 20) + 'deg) rotateY(' + ((cx - x) / 20) + 'deg) scale3d(1.02,1.02,1.02)';
        });
        card.addEventListener('mouseleave', function() {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)';
        });
    });
}

function initCounters() {
    var counters = document.querySelectorAll('.counter-val');

    counters.forEach(function(c, i) {
        // Disconnect previous observer to avoid multiple running instances on nav swap
        if (c._counterObs) {
            c._counterObs.disconnect();
        }

        var targetValue = parseInt(c.getAttribute('data-target'));
        
        if (isNaN(targetValue)) {
            console.warn("Counter", i, "has invalid target:", c.getAttribute('data-target'));
            return;
        }

        var obs = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {

                    var delay = 100 + i * 150;
                    setTimeout(function() {
                        animateValue(entry.target, 0, targetValue, 2000);
                    }, delay);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5, rootMargin: '0px 0px -50px 0px' }); // Trigger only when fully visible in viewport
        
        c._counterObs = obs;
        obs.observe(c);
    });
}

function animateValue(el, start, end, duration) {
    // Prevent overlapping duplicate animations
    if (el._animating === end) return;
    el._animating = end;

    var startTime = null;
    el.textContent = start.toLocaleString('en-IN'); // Reset to start value immediately

    function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function step(ts) {
        if (!startTime) startTime = ts;
        var elapsed = ts - startTime;
        var prog    = Math.min(elapsed / duration, 1);
        var eased   = easeOutExpo(prog);
        var current = Math.floor(eased * (end - start) + start);

        el.textContent = current.toLocaleString('en-IN');

        if (prog < 1) {
            requestAnimationFrame(step);
        } else {
            el.textContent = end.toLocaleString('en-IN');
            el._animating = false; // Reset state when completed
        }
    }
    requestAnimationFrame(step);
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
async function renderDashboard() {
    console.log("FETCHING DASHBOARD");
    
    // Wait for Supabase to resolve the initial session via our global promise
    if (window.authReadyPromise) {
        await window.authReadyPromise;
    }
    
    var user = window._authUser;
    
    if (!user || !user.id) {
        return '<div style="padding:160px 20px; text-align:center;">' +
            '<h3>Access Restricted</h3>' +
            '<p style="color:#666; margin:10px 0 20px;">Please log in to view your dashboard.</p>' +
            '<button class="btn btn-primary" onclick="window.navigate(\'login\')">Sign In</button>' +
        '</div>';
    }
    
    window._authUser = user;
    var meta = user.user_metadata || {};
    var name = meta.full_name || meta.name || meta.display_name || (user.email ? user.email.split('@')[0] : 'Student');
    var email = user.email || 'No email';
    var mobile = 'Loading...';
    var walletBal = 0;

    name = window.sanitizeHTML(name);
    email = window.sanitizeHTML(email);

    // Fetch asynchronously to prevent blocking the initial render
    if (user && user.id && window.supabaseClient) {
        window.supabaseClient.from('users').select('mobile_number, wallet_balance').eq('id', user.id).single()
        .then(({ data }) => {
            if (data) {
                var m = data.mobile_number || 'No Mobile Number';
                var el1 = document.getElementById('dash_mobile_display');
                if (el1) el1.textContent = m;

                var w = Number(data.wallet_balance || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
                var el2 = document.getElementById('dash_wallet_display');
                if (el2) el2.innerHTML = '<span style="font-size: 14px; font-weight: 600; opacity: 0.8;">₹</span>' + w;
            }
        }).catch(err => console.error(err));
    }

    var localStyles = '<style>' +
        '.dashboard-wrapper { display: flex !important; gap: 32px; padding: 120px 20px 60px; max-width: 1200px; margin: 0 auto; min-height: 80vh; color: #fff; }' +
        '.dashboard-sidebar { width: 340px; flex-shrink: 0; display: flex; flex-direction: column; gap: 24px; padding: 30px; background: rgba(255, 255, 255, 0.08) !important; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(244, 180, 0, 0.6) !important; border-radius: 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }' +
        '.dashboard-content { flex: 1; display: flex; flex-direction: column; gap: 32px; padding: 40px; background: rgba(255, 255, 255, 0.08) !important; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(244, 180, 0, 0.6) !important; border-radius: 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }' +
        '.sidebar-title { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 8px; letter-spacing: 0.5px; }' +
        '.sidebar-user-card { display: flex; align-items: center; gap: 16px; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); }' +
        '.sidebar-avatar { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #facc15, #eab308); color: #000; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 800; border: 2px solid rgba(244, 180, 0, 1); box-shadow: 0 0 15px rgba(244, 180, 0, 0.3); }' +
        '.sidebar-user-name { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 2px; }' +
        '.sidebar-user-email { font-size: 13px; color: rgba(255,255,255,0.6); }' +
        '.sidebar-user-mobile { font-size: 13px; color: #facc15; font-weight: 600; margin-top: 4px; }' +
        '.sidebar-menu { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }' +
        '.menu-item { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-radius: 14px; text-decoration: none; color: #fff; transition: all 0.3s ease; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); }' +
        '.menu-item:hover { background: rgba(244, 180, 0, 0.15); transform: translateX(8px); border-color: rgba(244, 180, 0, 0.6); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }' +
        '.menu-icon { color: #facc15; font-size: 18px; display: flex; align-items: center; }' +
        '.content-header h2 { font-size: 32px; font-weight: 800; color: #fff; margin-bottom: 8px; }' +
        '.placeholder-section { text-align: center; padding: 60px 40px; background: rgba(255,255,255,0.03); border-radius: 24px; border: 2px dashed rgba(255,255,255,0.15); }' +
        '.placeholder-icon { font-size: 48px; margin-bottom: 20px; filter: drop-shadow(0 0 10px rgba(244,180,0,0.3)); }' +
        '@media (max-width: 900px) { .dashboard-wrapper { flex-direction: column !important; padding-top: 100px; } .dashboard-sidebar { width: 100%; } }' +
    '</style>';

    var placeholderHtml = '<div class="placeholder-section">' +
        '<div class="placeholder-icon">🚀</div>' +
        '<h3 style="color:#fff; font-size:22px; font-weight:700;">Your journey starts here</h3>' +
        '<p style="color:rgba(255,255,255,0.6);margin:12px 0 24px; font-size:15px;">Complete your profile or book a session to get started.</p>' +
        '<button class="btn" style="background:#facc15; color:#000; font-weight:700; padding:12px 32px; border-radius:99px;" onclick="window.navigate(\'ebooks\')">Browse eBooks</button>' +
    '</div>';

    return localStyles + 
    '<div class="dashboard-wrapper">' +
        '<div class="dashboard-sidebar glass-panel">' +
            '<h3 class="sidebar-title">My Profile</h3>' +
            '<div class="sidebar-user-card">' +
                '<div class="sidebar-avatar">' + name.charAt(0).toUpperCase() + '</div>' +
                '<div class="sidebar-user-info">' +
                    '<div class="sidebar-user-name">' + name + '</div>' +
                    '<div class="sidebar-user-email">' + email + '</div>' +
                    '<div class="sidebar-user-mobile" id="dash_mobile_display">' + mobile + '</div>' +
                '</div>' +
            '</div>' +
            '<nav class="sidebar-menu">' +
                '<a href="#" class="menu-item" onclick="event.preventDefault(); window.navigate(\'orders\');">' +
                    '<span class="menu-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8V21H3V8"></path><path d="M1 3H23V8H1V3Z"></path><path d="M10 12H14"></path></svg></span>' +
                    '<span class="menu-label">Order History</span>' +
                '</a>' +
                '<div class="menu-item" style="flex-direction: column; align-items: flex-start; gap: 8px; padding: 20px; cursor: default;">' +
                    '<div style="display: flex; align-items: center; gap: 12px; cursor: pointer; width: 100%;" onclick="window.navigate(\'wallet\')">' +
                        '<span class="menu-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg></span>' +
                        '<span class="menu-label" style="font-weight: 700;">My Wallet</span>' +
                    '</div>' +
                    '<div style="width: 100%; margin-top: 4px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);">' +
                        '<div style="font-size: 10px; color: rgba(255,255,255,0.5); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Available Balance</div>' +
                        '<div id="dash_wallet_display" style="font-size: 24px; font-weight: 800; color: #facc15; margin-top: 2px; display: flex; align-items: baseline; gap: 4px;">' +
                            '<span style="font-size: 14px; font-weight: 600; opacity: 0.8;">₹</span>' + Number(walletBal).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + 
                        '</div>' +
                        '<div style="margin-top: 12px; display: flex; gap: 8px; width: 100%;">' +
                            '<button onclick="event.stopPropagation(); window.navigate(\'profile/refer-earn\')" style="flex: 1; padding: 8px; border-radius: 10px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #fff; font-size: 10px; font-weight: 700; cursor: pointer;">History</button>' +
                            '<button onclick="event.stopPropagation(); window.navigate(\'counselling\')" style="flex: 1; padding: 8px; border-radius: 10px; background: #facc15; border: none; color: #000; font-size: 10px; font-weight: 700; cursor: pointer;">Use Now</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="refer-earn-card" style="margin-top: 10px; padding: 20px; background: rgba(255,255,255,0.03); border-radius: 20px; border: 1px solid rgba(255,255,255,0.08); cursor: pointer;" onclick="window.navigate(\'profile/refer-earn\')">' +
                    '<div style="display: flex; align-items: center; gap: 10px;">' +
                        '<span style="font-size: 20px;">🎁</span>' +
                        '<div>' +
                            '<div style="font-size: 13px; font-weight: 700; color: #fff;">Refer & Earn</div>' +
                            '<div style="font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 2px;">Get 10% cashback on every referral.</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</nav>' +
        '</div>' +
        '<div class="dashboard-content glass-panel">' +
            '<div class="content-header">' +
                '<h2>Welcome back, ' + name + '! 👋</h2>' +
                '<p style="color:rgba(255,255,255,0.6);margin-top:4px;">Manage your counselling journey and active orders here.</p>' +
            '</div>' +
            '<div class="content-body">' +
                '<h3 style="margin-bottom:20px; color:#fff; font-size:20px; font-weight:700;">Active Items</h3>' +
                placeholderHtml +
            '</div>' +
        '</div>' +
    '</div>';
}

// ─── Order History ──────────────────────────────────────────────────────────
async function renderOrders() {
    console.log('FETCHING ORDERS');
    
    if (window.authReadyPromise) {
        await window.authReadyPromise;
    }
    var user = window._authUser;

    if (!user || !user.id) {
        return '<div style="padding:160px 20px; text-align:center;">' +
            '<h3>Access Restricted</h3>' +
            '<p style="color:#666; margin:10px 0 20px;">Please log in to view your order history.</p>' +
            '<button class="btn btn-primary" onclick="window.navigate(\'login\')">Sign In</button>' +
        '</div>';
    }

    var orders = [];
    if (window.supabaseClient) {
        try {
            var [ordersRes, counsellingRes] = await Promise.all([
                window.supabaseClient
                    .from('orders')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false }),
                window.supabaseClient
                    .from('counselling_bookings')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
            ]);
            
            if (ordersRes.error) throw ordersRes.error;
            
            const counsellingData = counsellingRes.data || [];
            const ordersData = ordersRes.data || [];
            
            // Build a lookup map from counselling_bookings by order_id for extra fields
            const counsellingMap = {};
            counsellingData.forEach(c => {
                if (c.order_id) counsellingMap[c.order_id] = c;
            });
            
            // PRIMARY SOURCE: Use orders table — it always has the correct payment_status and payment_id
            let allOrders = [];
            
            ordersData.forEach(o => {
                const counsellingExtra = counsellingMap[o.id.toString()] || {};
                allOrders.push({
                    ...o,
                    display_name: o.product_name || counsellingExtra.plan_name || 'Order',
                    display_amount: o.final_amount || o.amount_paid || counsellingExtra.discounted_price || 0,
                    // CRITICAL: Always use payment_status from orders table (the authoritative source)
                    payment_status: o.payment_status || o.status || 'pending',
                    razorpay_payment_id: o.razorpay_payment_id || null,
                    type: (o.product_name && (o.product_name.toLowerCase().includes('ebook') || o.product_name.toLowerCase().includes('book'))) ? 'ebook' : 'counselling'
                });
            });

            // Sort combined array by created_at descending
            allOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            orders = allOrders;

        } catch(err) {
            console.error('[App] Failed to fetch orders:', err);
            return '<div style="padding:160px 20px; text-align:center; color:#ef4444;">Error loading orders. Please try again.</div>';
        }
    }

    var html = '<div class="orders-page-wrapper" style="padding:120px 20px 60px; max-width: 1000px; margin: 0 auto; min-height: 80vh;">' +
        '<div class="orders-container-premium" style="padding:40px; border-radius: 24px; background: rgba(255, 255, 255, 0.08) !important; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(244, 180, 0, 0.6) !important; box-shadow: 0 8px 32px rgba(0,0,0,0.4);">' +
            '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px; flex-wrap: wrap; gap: 15px;">' +
                '<div>' +
                    '<h2 style="font-size: 32px; font-weight: 800; color: #fff;">Order History</h2>' +
                    '<p style="color:rgba(255,255,255,0.6); font-size: 14px;">Review all your purchases and transactions here.</p>' +
                '</div>' +
                '<button class="btn" style="background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); border-radius: 99px; padding: 10px 20px;" onclick="window.navigate(\'dashboard\')">← Back to Dashboard</button>' +
            '</div>';

    if (orders.length === 0) {
        html += '<div style="text-align:center; padding:80px 20px; background: rgba(255,255,255,0.03); border-radius: 16px; border: 2px dashed rgba(255,255,255,0.15);">' +
            '<div style="font-size: 48px; margin-bottom: 20px; filter: drop-shadow(0 0 10px rgba(244,180,0,0.3));">📦</div>' +
            '<h3 style="font-weight: 700; color: #fff;">No orders yet</h3>' +
            '<p style="color:rgba(255,255,255,0.6); margin-top: 5px;">You haven\'t made any purchases yet.</p>' +
            '<button class="btn" style="margin-top:20px; background:#facc15; color:#000; font-weight:700;" onclick="window.navigate(\'counselling\')">Browse Plans</button>' +
        '</div>';
    } else {
        html += '<div style="display: flex; flex-direction: column; gap: 20px; margin-top: 20px;">';

        orders.forEach(function(order) {
            var badgeBg = '#666';
            if (order.payment_status === 'success' || order.payment_status === 'paid' || order.payment_status === 'completed') badgeBg = '#22c55e'; // Green
            else if (order.payment_status === 'failed') badgeBg = '#ef4444'; // Red
            else if (order.payment_status === 'cancelled') badgeBg = '#f59e0b'; // Yellow
            else if (order.payment_status === 'initiated') badgeBg = '#3b82f6'; // Blue

            // Formatting Date to DD/MM/YYYY
            var d = new Date(order.created_at);
            var dateStr = ("0" + d.getDate()).slice(-2) + "/" + ("0" + (d.getMonth() + 1)).slice(-2) + "/" + d.getFullYear();
            
            var typeIcon = order.type === 'ebook' ? '📘' : '🧑‍⚕️';
            var postMessage = '';
            if (order.payment_status === 'success' || order.payment_status === 'paid' || order.payment_status === 'completed') {
                if (order.type === 'ebook') {
                    postMessage = '<span style="font-size: 16px;">📩</span> Check your WhatsApp / Email for your PDF.';
                } else {
                    postMessage = '<span style="font-size: 16px;">📞</span> Our team will contact you shortly.';
                }
            }

            html += '<div class="order-card-premium" style="background: rgba(255,255,255,0.05) !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">' +
                        
                        '<div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 15px;">' +
                            '<div>' +
                                '<div class="order-id-label" style="font-size: 12px; color: rgba(255,255,255,0.4); font-family: monospace; margin-bottom: 4px; font-weight: 600;">ORDER ID: ' + (order.id || 'N/A').split('-')[0].toUpperCase() + '</div>' +
                                '<h3 style="font-size: 18px; font-weight: 700; color: #fff; margin: 0;">' + typeIcon + ' ' + order.display_name + '</h3>' +
                            '</div>' +
                            '<div style="text-align: right;">' +
                                '<span style="display: inline-block; padding: 6px 12px; border-radius: 8px; background:' + badgeBg + '; color:#fff; font-weight:700; font-size:12px; text-transform:uppercase;">' + order.payment_status + '</span>' +
                            '</div>' +
                        '</div>' +
                        
                        '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-top: 10px; padding-top: 15px; border-top: 1px dashed rgba(255,255,255,0.1);">' +
                            '<div>' +
                                '<div style="font-size: 11px; color: rgba(255,255,255,0.5); text-transform: uppercase; font-weight: 600;">Date</div>' +
                                '<div style="font-size: 14px; color: #fff; font-weight: 500; margin-top: 4px;">' + dateStr + '</div>' +
                            '</div>' +
                            '<div>' +
                                '<div style="font-size: 11px; color: rgba(255,255,255,0.5); text-transform: uppercase; font-weight: 600;">Amount</div>' +
                                '<div style="font-size: 14px; color: #facc15; font-weight: 700; margin-top: 4px;">₹' + order.display_amount + '</div>' +
                            '</div>' +
                            '<div style="display: flex; align-items: flex-end; gap: 8px;">' +
                                '<div style="flex: 1;">' +
                                    '<div style="font-size: 11px; color: rgba(255,255,255,0.5); text-transform: uppercase; font-weight: 600;">Payment ID</div>' +
                                    '<div style="font-size: 13px; color: rgba(255,255,255,0.7); font-family: monospace; font-weight: 500; margin-top: 4px;">' + (order.razorpay_payment_id || '—') + '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +

                        (postMessage ? 
                        '<div style="margin-top: 5px; text-align: left; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 15px; font-size: 13.5px; color: #facc15; font-weight: 600; display: flex; align-items: center; gap: 8px;">' +
                            postMessage +
                        '</div>' : '') +

                    '</div>';
        });

        html += '</div>';
    }

    html += '</div></div>';
    return html;
}

// ─── Wallet History ─────────────────────────────────────────────────────────
async function renderWallet() {
    console.log('FETCHING WALLET');
    
    if (window.authReadyPromise) {
        await window.authReadyPromise;
    }
    var user = window._authUser;

    if (!user || !user.id) {
        return '<div style="padding:160px 20px; text-align:center;"><h3>Access Restricted</h3><button class="btn btn-primary" onclick="window.navigate(\'login\')">Sign In</button></div>';
    }

    var walletBalance = 0;
    var transactions = [];

    if (window.supabaseClient) {
        try {
            const [userRes, transRes] = await Promise.all([
                window.supabaseClient.from('users').select('wallet_balance').eq('id', user.id).single(),
                window.supabaseClient.from('wallet_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
            ]);
            if (userRes.data) walletBalance = userRes.data.wallet_balance || 0;
            if (transRes.data) transactions = transRes.data;
        } catch (err) {
            console.error('[App] Failed to fetch wallet data:', err);
        }
    }

    var html = '<div class="wallet-page-wrapper" style="padding:120px 20px 60px; max-width: 1000px; margin: 0 auto;">' +
        '<div class="wallet-container-premium" style="padding:40px; border-radius: 24px; background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(16px); border: 1px solid rgba(244, 180, 0, 0.6); box-shadow: 0 8px 32px rgba(0,0,0,0.4);">' +
            '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:40px;">' +
                '<div>' +
                    '<h2 style="font-size: 32px; font-weight: 800; color: #fff;">My Wallet</h2>' +
                    '<p style="color:rgba(255,255,255,0.6);">View your balance and transaction history.</p>' +
                '</div>' +
                '<button class="btn" style="background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); border-radius: 99px; padding: 10px 20px;" onclick="window.navigate(\'dashboard\')">← Back</button>' +
            '</div>' +
            
            '<div style="background: linear-gradient(135deg, #facc15 0%, #eab308 100%); padding: 30px; border-radius: 20px; margin-bottom: 40px; color: #000;">' +
                '<div style="font-size: 14px; font-weight: 600; opacity: 0.8; text-transform: uppercase;">Current Balance</div>' +
                '<div style="font-size: 48px; font-weight: 800; margin-top: 5px;">₹' + walletBalance + '</div>' +
            '</div>' +

            '<h3 style="color: #fff; margin-bottom: 20px; font-size: 20px;">Transaction History</h3>';

    if (transactions.length === 0) {
        html += '<div style="text-align:center; padding:40px; border: 1px dashed rgba(255,255,255,0.2); border-radius: 16px; color: rgba(255,255,255,0.5);">No transactions yet.</div>';
    } else {
        html += '<div style="display: flex; flex-direction: column; gap: 12px;">';
        transactions.forEach(function(tx) {
            var isCredit = tx.amount > 0;
            var d = new Date(tx.created_at);
            var dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            
            html += '<div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center;">' +
                        '<div>' +
                            '<div style="color: #fff; font-weight: 600;">' + tx.description + '</div>' +
                            '<div style="color: rgba(255,255,255,0.4); font-size: 12px; margin-top: 4px;">' + dateStr + ' • ' + tx.type.replace('_', ' ').toUpperCase() + '</div>' +
                        '</div>' +
                        '<div style="font-size: 18px; font-weight: 700; color: ' + (isCredit ? '#22c55e' : '#ef4444') + ';">' + (isCredit ? '+' : '') + '₹' + Math.abs(tx.amount) + '</div>' +
                    '</div>';
        });
        html += '</div>';
    }

    html += '</div></div>';
    return html;
}

window.openAddMobileModal = function() {
    var modal = document.getElementById('addMobileModal');
    var overlay = document.getElementById('modalOverlay');
    if(modal) {
        modal.style.display = 'block';
        modal.style.zIndex = '10000001';
    }
    if(overlay) {
        overlay.style.display = 'block';
        overlay.style.zIndex = '10000000';
    }
};

window.closeAddMobileModal = function() {
    var modal = document.getElementById('addMobileModal');
    var overlay = document.getElementById('modalOverlay');
    if(modal) modal.style.display = 'none';
    if(overlay) overlay.style.display = 'none';
    
    var form = document.getElementById('addMobileForm');
    if(form) form.reset();
    
    var err = document.getElementById('addMobileError');
    if(err) err.style.display = 'none';
};

window.saveMobileNumber = async function() {
    var numInp = document.getElementById('newMobileNumber');
    var btn = document.getElementById('addMobileSubmitBtn');
    var err = document.getElementById('addMobileError');
    if (!numInp || !numInp.value) return;
    var num = numInp.value.trim();
    
    if (!window.supabaseClient || !window._authUser) {
        if(err) { err.innerText = "Auth service unavailable."; err.style.display = "block"; }
        return;
    }
    
    if(btn) { btn.disabled = true; btn.innerText = "Saving..."; }
    if(err) err.style.display = "none";
    
    try {
        var meta = window._authUser.user_metadata || {};
        var fallbackEmail = window._authUser.email || '';
        var fallbackName = meta.full_name || meta.name || meta.display_name || (fallbackEmail ? fallbackEmail.split('@')[0] : 'Student');
        
        var res = await window.supabaseClient.from('users').upsert({
            id: window._authUser.id,
            mobile_number: num,
            email: fallbackEmail,
            name: fallbackName
        }, { onConflict: 'id' });
        
        if (res.error) throw res.error;
        
        // Success Feedback
        alert("Mobile number saved successfully!");
        
        window.closeAddMobileModal();
        
        // Immediate UI Update
        if (window._authUser) {
            // Update the display field in the dropdown if it exists
            var pdMobile = document.getElementById('pdMobile');
            if (pdMobile) pdMobile.innerText = num;

            var dashEl = document.getElementById('section-dashboard');
            if (dashEl && dashEl.style.display === 'block') {
                dashEl.innerHTML = '<div style="padding:120px 20px;text-align:center;"><div class="loading-spinner"></div><br>Updating Profile...</div>';
                renderDashboard().then(html => {
                    if (html) dashEl.innerHTML = html;
                });
            }
        }
    } catch(e) {
        if(err) { err.innerText = e.message || "Failed to save number."; err.style.display = "block"; }
    } finally {
        if(btn) { btn.disabled = false; btn.innerText = "Save Number"; }
    }
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
// ─── Auth ─────────────────────────────────────────────────────────────────────
// Functions doLogout and updateNavForAuth have been natively moved to index.html to guarantee DOM load synchronization

// ==============================================================================

// ─── Login Page Logic ─────────────────────────────────────────────────────────
// Auth Modal Global Handlers
window.openAuthModal = function() {
    var m = document.getElementById('authModal');
    var o = document.getElementById('modalOverlay');
    if (m) m.style.display = 'block';
    if (o) o.style.display = 'block';
    window.switchAuthModalTab('login');
};

window.closeAuthModal = function() {
    var m = document.getElementById('authModal');
    var o = document.getElementById('modalOverlay');
    if (m) m.style.display = 'none';
    if (o) o.style.display = 'none';
};

window.switchAuthModalTab = function(tab) {
    var isLogin = tab === 'login';
    var lForm = document.getElementById('authModalLoginForm');
    var rForm = document.getElementById('authModalRegisterForm');
    var lTab = document.getElementById('authTabLogin');
    var rTab = document.getElementById('authTabRegister');
    var title = document.getElementById('authModalTitle');
    var sub = document.getElementById('authModalSubtitle');

    if (lForm) lForm.style.display = isLogin ? 'block' : 'none';
    if (rForm) rForm.style.display = isLogin ? 'none' : 'block';
    
    if (lTab) {
        if (isLogin) lTab.classList.add('active');
        else lTab.classList.remove('active');
    }
    if (rTab) {
        if (!isLogin) rTab.classList.add('active');
        else rTab.classList.remove('active');
    }

    if (title) title.innerText = isLogin ? 'Welcome Back 👋' : 'Create Account 🚀';
    if (sub) sub.innerText = isLogin ? 'Login to continue' : 'Join us today';
};

window.submitAuthModal = async function(type) {
    var isSignUp = type === 'register';
    var email = document.getElementById(isSignUp ? 'authRegEmail' : 'authLoginEmail').value.trim();
    var pass = document.getElementById(isSignUp ? 'authRegPass' : 'authLoginPass').value;
    var name = isSignUp ? document.getElementById('authRegName').value.trim() : '';
    
    if (!email || !pass || (isSignUp && !name)) {
        alert('Please fill in all required fields.');
        return;
    }

    var btn = document.querySelector('#authModal ' + (isSignUp ? '#authModalRegisterForm' : '#authModalLoginForm') + ' button');
    var originalText = btn.innerText;
    btn.innerText = 'Processing...';
    btn.disabled = true;

    try {
        var res;
        
        var timeoutPromise = new Promise(function(_, reject) { 
            setTimeout(function() { reject(new Error('NetworkError when attempting to fetch resource: Request timed out')); }, 15000);
        });

        if (isSignUp) {
            console.log("SIGNUP STARTED");
            var signupPromise = window.supabaseClient.auth.signUp({
                email: email,
                password: pass,
                options: { data: { full_name: name }, emailRedirectTo: window.location.origin }
            });
            res = await Promise.race([signupPromise, timeoutPromise]);
            console.log("SIGNUP RESPONSE:", res.data);
            if (res.error) console.log("SIGNUP ERROR:", res.error);
        } else {
            var signinPromise = window.supabaseClient.auth.signInWithPassword({ email: email, password: pass });
            res = await Promise.race([signinPromise, timeoutPromise]);
        }

        if (res.error) {
            alert(res.error.message);
        } else {
            if (isSignUp && res.data && res.data.user) {
                setTimeout(() => window.processReferralSignup(res.data.user, email, name), 500);
            }
            if (isSignUp && !res.data.session) {
                alert('Account created! Please check your email for a confirmation link.');
            } else {
                window.closeAuthModal();
                if (window.updateNavForAuth) window.updateNavForAuth(res.data.session);
            }
        }
    } catch (e) {
        console.error("SIGNUP FAILED:", e);
        alert('An error occurred: ' + e.message);
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
};

function setupLoginPage() {
    // We handle submission via onsubmit in HTML for the main login page to avoid double listeners
    
    // Google OAuth button
    var gBtn = document.getElementById('googleLoginBtn');
    if (gBtn) {
        gBtn.addEventListener('click', async function() {
            var errBox = document.getElementById('pageAuthError');
            if (errBox) errBox.style.display = 'none';
            if (!window.supabaseClient) { 
                if (errBox) { errBox.innerText = 'Auth service unavailable.'; errBox.style.display = 'block'; }
                return; 
            }
            gBtn.disabled = true;
            gBtn.innerHTML = '<span class="spinner-small"></span> Connecting to Google…';
            var result = await window.supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: { 
                    redirectTo: window.location.origin,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent'
                    }
                }
            });
            if (result.error) {
                if (errBox) { errBox.innerText = result.error.message; errBox.style.display = 'block'; }
                gBtn.disabled = false;
                gBtn.innerHTML = '<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" height="18"> Continue with Google';
            }
        });
    }
}

window.handleEmailLogin = async function(e) {
    if (e && e.preventDefault) {
        e.preventDefault();
        e.stopPropagation();
    }

    var errBox   = document.getElementById('pageAuthError');
    var okBox    = document.getElementById('pageAuthSuccess');
    var btn      = document.getElementById('pageAuthSubmitBtn');
    var nameInp  = document.getElementById('pageAuthName');
    
    function showErr(msg) { 
        if(errBox){ 
            var lowerMsg = msg.toLowerCase();
            if (msg.includes('429') || lowerMsg.includes('too many requests') || lowerMsg.includes('rate limit exceeded')) {
                msg = '⚠️ Too many attempts. Please wait 5-10 minutes before trying again.';
            } else if (msg.includes('Email address') && msg.includes('invalid')) {
                msg = '📧 Invalid email format or restricted domain. Please try a different email.';
            }
            errBox.innerText = msg; 
            errBox.style.display = 'block'; 
        } 
        if(okBox) okBox.style.display = 'none'; 
    }
    function showOk(msg)  { if(okBox){ okBox.innerText = msg; okBox.style.display = 'block'; } if(errBox) errBox.style.display = 'none'; }
    function clearMsg()   { if(errBox) errBox.style.display = 'none'; if(okBox) okBox.style.display = 'none'; }

    clearMsg();

    var isSignUp = window._isSignUp;
    var email = document.getElementById('pageAuthEmail').value.trim();
    var pass  = document.getElementById('pageAuthPassword').value;
    var full  = nameInp ? nameInp.value.trim() : '';
    var mobile = '';

    if (!email || !pass) {
        showErr('Please enter both email and password.');
        return false;
    }
    if (isSignUp && (!full || full.length < 2)) {
        showErr('Please enter your full name.');
        return false;
    }

    // ─── Rate Limiting Check ─────────────────────────────────────────
    if (isLoginRateLimited()) {
        var secs = getLoginLockoutRemaining();
        showErr('⚠️ Too many login attempts. Please wait ' + Math.ceil(secs / 60) + ' minute(s) before trying again.');
        return false;
    }

    // ─── Strong Password Validation ──────────────────────────────────
    var passErr = validatePasswordStrength(pass);
    if (passErr) {
        showErr(passErr);
        return false;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerText = isSignUp ? 'Creating…' : 'Signing In…';
    }

    if (!window.supabaseClient) {
        for (var i = 0; i < 30 && !window.supabaseClient; i++) {
            await new Promise(function(r) { setTimeout(r, 100); });
        }
    }
    if (!window.supabaseClient) {
        showErr('Auth service is still loading. Please try again in a moment.');
        alert('Error: Could not connect to Supabase backend! Please ensure your internet connection allows script loading from https://cdn.jsdelivr.net .');
        if (btn) {
            btn.disabled = false;
            btn.innerText = isSignUp ? 'Sign Up' : 'Sign In';
        }
        return false;
    }

    try {
        if (isSignUp) {
            console.log("SIGNUP STARTED");
            
            var signupPromise = window.supabaseClient.auth.signUp({ 
                email: email, 
                password: pass, 
                options: { 
                    data: { 
                        full_name: full 
                    },
                    emailRedirectTo: window.location.origin
                } 
            });

            var timeoutPromise = new Promise(function(_, reject) { 
                setTimeout(function() { reject(new Error('NetworkError when attempting to fetch resource: Signup request timed out')); }, 15000);
            });
            
            var res = await Promise.race([signupPromise, timeoutPromise]);
            
            console.log("SIGNUP RESPONSE:", res.data);
            if (res.error) console.log("SIGNUP ERROR:", res.error);

            if (res.error) { 
                showErr(res.error.message); 
            } else if (res.data && res.data.user && res.data.user.identities && res.data.user.identities.length === 0) {
                showErr('⚠️ An account with this email already exists. Please switch to Sign In instead.');
            } else { 
                // ── REFERRAL SYSTEM: Run in background to prevent blocking UI ──
                setTimeout(function() {
    if (res.data && res.data.user) {
        window.processReferralSignup(res.data.user, email, full);
    }
}, 500);

                if (res.data && res.data.session) {
                    showOk('✅ Account created successfully! Returning to home...');
                    if (window.updateNavForAuth) window.updateNavForAuth(res.data.session);
                    setTimeout(function() { 
                        if (window.activeEbookContext && window.activeEbookContext.course) {
                            var dest = window.activeEbookContext.origin || 'ebooks';
                            window.navigate(dest);
                            setTimeout(function() {
                                if (window.openEbookPurchaseModal) {
                                    window.openEbookPurchaseModal(window.activeEbookContext.course, window.activeEbookContext.quota, window.activeEbookContext.price, window.activeEbookContext.title);
                                }
                            }, 500);
                        } else {
                            window.navigate('home');
                        } 
                    }, 500);
                } else {
                    showOk('✅ Account created! Please check your email for a confirmation link to sign in.');
                }
            }
        } else {
            recordLoginAttempt();
            var res2 = await window.supabaseClient.auth.signInWithPassword({ email: email, password: pass });

            if (res2.error) { showErr(res2.error.message); }
            else {
                _loginAttempts = [];
                if (window.updateNavForAuth) window.updateNavForAuth(res2.data.session);
                window.navigate('home');
            }
        }
    } catch(err) {
        console.error("SIGNUP FAILED:", err);
        showErr(err.message || 'Something went wrong. Please verify your connection and credentials.');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerText = isSignUp ? 'Sign Up' : 'Sign In';
        }
    }
    return false;
};

// ─── Global Google Sign-In ────────────────────────────────────────────────────
async function signInWithGoogle() {
    if (!window.supabaseClient) { alert('Auth service unavailable.'); return; }
    var result = await window.supabaseClient.auth.signInWithOAuth({ 
        provider: 'google', 
        options: { 
            redirectTo: window.location.href.split('#')[0].split('?')[0],
            queryParams: {
                access_type: 'offline',
                prompt: 'consent'
            }
        } 
    });
    if (result.error) alert('Google sign-in failed: ' + result.error.message);
}

// ─── Predictor Modal ──────────────────────────────────────────────────────────
function setupPredictorModal() {
    var navBtn = document.getElementById('predictorBtn');
    if (navBtn) {
        navBtn.addEventListener('click', function() {
            document.getElementById('predictorModal').style.display = 'block';
            document.getElementById('modalOverlay').style.display = 'block';
        });
    }
    var closeBtn = document.getElementById('closePredictorBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            document.getElementById('predictorModal').style.display = 'none';
            document.getElementById('modalOverlay').style.display = 'none';
            resetPredictor();
        });
    }
}

function simulatePrediction() {
    document.getElementById('predictorInputStep').style.display = 'none';
    document.getElementById('predictorLoadingStep').style.display = 'block';
    setTimeout(function() {
        document.getElementById('predictorLoadingStep').style.display = 'none';
        document.getElementById('predictorResultStep').style.display = 'block';
        var results = [
            { name: 'MAMC, New Delhi', prob: '85%', color: '#22c55e' },
            { name: 'VMMC, New Delhi', prob: '92%', color: '#22c55e' },
            { name: 'AIIMS, New Delhi', prob: '12%', color: '#ef4444' },
            { name: 'UCMS, New Delhi', prob: '98%', color: '#3b82f6' }
        ];
        var html = '';
        results.forEach(function(r) {
            html += '<div class="result-card" style="background:rgba(255,255,255,.03);border:1px solid var(--glass-border);border-radius:var(--radius-md);padding:15px;margin-bottom:10px;">' +
                '<div style="display:flex;justify-content:space-between;margin-bottom:5px;">' +
                '<span style="font-weight:600;">' + r.name + '</span>' +
                '<span style="color:' + r.color + ';font-weight:700;">' + r.prob + '</span></div>' +
                '<div style="width:100%;height:6px;background:rgba(0,0,0,.3);border-radius:10px;overflow:hidden;">' +
                '<div class="progress-bar" style="width:0%;height:100%;background:' + r.color + ';border-radius:10px;transition:width 1s ease-out;"></div></div></div>';
        });
        document.getElementById('resultsContainer').innerHTML = html;
        setTimeout(function() {
            var bars = document.querySelectorAll('#resultsContainer .progress-bar');
            bars.forEach(function(bar, i) { bar.style.width = results[i].prob; });
        }, 50);
    }, 2000);
}

function resetPredictor() {
    document.getElementById('predictorInputStep').style.display = 'block';
    document.getElementById('predictorLoadingStep').style.display = 'none';
    document.getElementById('predictorResultStep').style.display = 'none';
    document.getElementById('predictorForm').reset();
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

bootApp();

// ─── Counselling Booking Handlers ──────────────────────────────────────────────

window.activeCounsellingContext = null;

window.openCounsellingBooking = function(planId) {
    const meta = COUNSELLING_META[planId];
    if (!meta) {
        console.error("Invalid Counselling Plan:", planId);
        return;
    }

    if (!window._authUser && window.supabaseClient) {
        alert("Please login first to book your counselling plan.");
        window.navigate('login');
        return;
    }

    window.activeCounsellingContext = { planId, ...meta };

    // Fill user data
    if (window._authUser) {
        const userMeta = window._authUser.user_metadata || {};
        const fullNameInput = document.querySelector('input[name="full_name"]') || document.getElementById('cb_full_name');
        const emailInput = document.querySelector('input[name="email"]') || document.getElementById('cb_email');
        if (fullNameInput) fullNameInput.value = userMeta.full_name || userMeta.name || '';
        if (emailInput) emailInput.value = window._authUser.email || '';
    }

    // Modal Display
    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById('counsellingBookingModal').style.display = 'block';
    
    // Update labels
    const titleEl = document.querySelector('#counsellingBookingModal h2');
    if (titleEl) titleEl.innerText = "Book: " + meta.title;
};

window.closeCounsellingBookingModal = function() {
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('counsellingBookingModal').style.display = 'none';
};

window.submitCounsellingBooking = async function(form) {
    let submitBtn = document.querySelector('#counsellingBookingModal .eb-btn');
    if (form) submitBtn = form.querySelector('[name=submit_button]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Processing...";
    submitBtn.disabled = true;

    try {
        const formData = form ? new FormData(form) : new FormData(document.getElementById('bookingForm'));
        const obj = Object.fromEntries(formData.entries());

        const ctx = window.activeCounsellingContext;
        
        const recordData = {
            user_id: window._authUser ? window._authUser.id : null,
            full_name: obj.full_name,
            email: obj.email,
            mobile_number: obj.mobile_number,
            category: obj.category,
            domicile_state: obj.domicile_state,
            neet_score: parseInt(obj.neet_score) || null,
            all_india_rank: parseInt(obj.all_india_rank) || null,
            plan_type: ctx.planId,
            plan_name: ctx.title,
            plan_price: ctx.price,
            counselling_type: ctx.type
        };

        sessionStorage.setItem('counselling_payment_data', JSON.stringify(recordData));
        window.location.href = '/payment/index.html';

    } catch (e) {
        console.error(e);
        alert("Unexpected error. Please try again.");
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
};

window.submitNewCounsellingForm = async function(form) {
    const btn = form.querySelector('[name=submit_button]');
    const originalText = btn.innerText;
    btn.innerText = "Processing...";
    btn.disabled = true;

    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        if (window.activeCounsellingContext) {
            data.selected_plan = window.activeCounsellingContext.planId;
            data.plan_name = window.activeCounsellingContext.title;
            data.plan_price = window.activeCounsellingContext.price;
            data.counselling_type = window.activeCounsellingContext.type;
        }

        const response = await fetch(`http://${window.location.hostname}:3000/submit-counseling-booking`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (response.ok && result.success) {
            alert("Counseling session booked successfully!");
            form.reset();
            window.closeCounsellingBookingModal();
        } else {
            alert(result.error || "Failed to book counseling session.");
        }
    } catch (error) {
        console.error("Form Submit Error:", error);
        alert("Unexpected error submitting form.");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
};
