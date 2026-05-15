const fs = require('fs');

const globalRefLogic = `
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
`;

const pathApp = 'c:\\Users\\rushi\\Downloads\\DCneetcounselling\\frontend\\web\\js\\app_v2.js';
let appContent = fs.readFileSync(pathApp, 'utf8');

if (!appContent.includes('window.processReferralSignup = async function')) {
    appContent = globalRefLogic + '\n' + appContent;
}

// Replace the hardcoded block in handleEmailLogin with a call to the global function
const handleEmailBlockRegex = /setTimeout\(async function\(\) \{\s*try \{\s*if \(res\.data && res\.data\.user && res\.data\.user\.id\) \{[\s\S]*?\}, 500\);/g;

appContent = appContent.replace(handleEmailBlockRegex, `setTimeout(function() {
    if (res.data && res.data.user) {
        window.processReferralSignup(res.data.user, email, full);
    }
}, 500);`);

// Add it to submitAuthModal as well!
const submitAuthModalRegex = /if \(isSignUp && !res\.data\.session\) \{\s*alert\('Account created! Please check your email for a confirmation link\.'\);\s*\}/g;
appContent = appContent.replace(submitAuthModalRegex, `if (isSignUp && res.data && res.data.user) {
                setTimeout(() => window.processReferralSignup(res.data.user, email, name), 500);
            }
            if (isSignUp && !res.data.session) {
                alert('Account created! Please check your email for a confirmation link.');
            }`);

fs.writeFileSync(pathApp, appContent, 'utf8');

// Also update index.html inline script!
const pathHtml = 'c:\\Users\\rushi\\Downloads\\DCneetcounselling\\frontend\\web\\index.html';
let htmlContent = fs.readFileSync(pathHtml, 'utf8');

const indexHtmlRegex = /if \(okBox\) \{\s*okBox\.innerText = "Success! You are now registered\.";\s*okBox\.style\.display = "block";\s*\}/g;

htmlContent = htmlContent.replace(indexHtmlRegex, `if (res.data && res.data.user) {
                      setTimeout(() => { if (window.processReferralSignup) window.processReferralSignup(res.data.user, email, name); }, 500);
                    }
                    if (okBox) {
                      okBox.innerText = "Success! You are now registered.";
                      okBox.style.display = "block";
                    }`);

fs.writeFileSync(pathHtml, htmlContent, 'utf8');
console.log('Patched globally!');
