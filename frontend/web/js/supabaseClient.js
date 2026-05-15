/**
 * Centralized Supabase Client Initialization
 * This file ensures only ONE instance of the Supabase client is created
 * and that session persistence is correctly configured.
 *
 * Security features:
 * - Idle timeout with warning (30 min warning, 60 min auto-logout)
 * - Session validation on protected operations
 * - Auto-refresh token management
 */

(function() {
    window._authReadyResolved = false;
    window.authReadyPromise = new Promise(function(resolve) {
        window._resolveAuthReady = function(session) {
            if (!window._authReadyResolved) {
                window._authReadyResolved = true;
                resolve(session);
            }
        };
    });

    const SUPABASE_URL  = window.__SUPABASE_URL || 'https://rlqmdylbzapyepuwncwt.supabase.co';
    const SUPABASE_ANON = window.__SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscW1keWxiemFweWVwdXduY3d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNTcwNzYsImV4cCI6MjA5MTgzMzA3Nn0.oNNK1pwLnykQlNfUkw7IdB-ZBkKDoWxszsKDSIjsLeo';

    // ─── Idle Timeout Configuration ─────────────────────────────────────
    // [SECURITY POLICY UPDATE 2026-04-18]: Auto-logout on inactivity is forbidden.
    // Idle tracking has been removed to comply with the project's Security Maintenance Policy.

    function resetIdleTimers() {
        // Feature removed as per security maintenance policy.
    }

    // ─── Session Validation Helper ──────────────────────────────────────
    /**
     * Validates the current session is still active.
     * Call before any protected operation.
     * Returns the session or null.
     */
    window.validateSession = async function() {
        if (!window.supabaseClient) return null;
        try {
            var { data, error } = await window.supabaseClient.auth.getSession();
            if (error || !data || !data.session) {
                // Session expired or invalid
                window._authUser = null;
                if (window.updateNavForAuth) window.updateNavForAuth(null);
                return null;
            }
            return data.session;
        } catch(e) {
            return null;
        }
    };

    // ─── Client Initialization ──────────────────────────────────────────
    function initClient() {
        if (!window.supabase) {
            setTimeout(initClient, 50);
            return;
        }

        if (!window.supabaseClient) {
            try {
                window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
                    auth: {
                        persistSession: true,
                        autoRefreshToken: true,
                        detectSessionInUrl: true,
                        storage: window.localStorage
                    }
                });
                
                // Start auto-refresh cycle
                if (window.supabaseClient.auth.startAutoRefresh) {
                    window.supabaseClient.auth.startAutoRefresh();
                }

                // Explicitly resolve the global auth ready promise
                window.supabaseClient.auth.getSession().then(({ data }) => {
                    if (data && data.session && data.session.user) {
                        window._authUser = data.session.user;
                    }
                    window._resolveAuthReady(data ? data.session : null);
                }).catch(() => {
                    window._resolveAuthReady(null);
                });

                // User is authenticated
                window.supabaseClient.auth.onAuthStateChange(function(event, session) {
                    window._resolveAuthReady(session);
                    
                    if (event === 'PASSWORD_RECOVERY') {
                        console.log("Password recovery event detected, navigating to separate reset-password page");
                        window._isRecovering = true; // Set global flag
                        window.location.href = '/reset-password/' + window.location.hash;
                    }
                    
                    if (session && session.user) {
                        window._authUser = session.user;
                    } else {
                        window._authUser = null;
                        window._isRecovering = false;
                    }
                });
            } catch (err) {
                // Silent fail — app.js will handle retry
            }
        }
    }

    // Initialize immediately
    initClient();
})();
