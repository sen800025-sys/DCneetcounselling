require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function debugReferral() {
  console.log("=== STARTING REFERRAL DEBUG ===");
  
  // 1. Pick a random existing user to be the referrer
  const { data: users } = await supabase.from('users').select('id, email, referral_token, full_name, name').limit(5);
  const referrer = users.find(u => u.referral_token);
  
  if (!referrer) {
    console.error("No referrer found with a token!");
    return;
  }
  
  console.log(`[1] Selected Referrer: ${referrer.email} (Token: ${referrer.referral_token})`);

  // 2. Simulate new user signing up by grabbing an existing user
  const { data: testUsers } = await supabase.from('users').select('id, email').is('referred_by', null).neq('id', referrer.id).limit(1);
  const testUser = testUsers[0];
  
  if (!testUser) {
    console.error("No test user found!");
    return;
  }
  
  const newUserId = testUser.id;
  const newUserEmail = testUser.email;
  console.log(`[2] Simulating signup for: ${newUserEmail} (ID: ${newUserId})`);

  // 3. Simulate app_v2.js SIGNED_IN logic
  console.log("[3] Running referral linkage logic...");
  const pendingRef = referrer.referral_token;
  
  const { data: refUser, error: refErr } = await supabase.from('users').select('id, full_name, name, email').eq('referral_token', pendingRef).maybeSingle();
  
  if (refErr) console.error("Error fetching refUser:", refErr);
  if (!refUser) {
    console.error("Could not find user for pendingRef:", pendingRef);
  } else {
    console.log(`[3a] Found referrer by token: ${refUser.email}`);
    
    // Update referred_by
    const { error: upErr } = await supabase.from('users').update({ referred_by: refUser.id }).eq('id', newUserId);
    if (upErr) console.error("Error updating referred_by:", upErr);
    else console.log("[3b] Updated referred_by on new user");
    
    // Insert into referrals
    const { data: newRef, error: rErr } = await supabase.from('referrals').insert({
        referrer_id: refUser.id,
        referred_user_id: newUserId,
        referrer_name: refUser.full_name || refUser.name || 'Unknown',
        referrer_email: refUser.email || 'N/A',
        referred_user_name: 'New Test User',
        referred_user_email: newUserEmail,
        referral_token: pendingRef,
        status: 'joined'
    }).select('id').single();
    
    if (rErr) console.error("Error inserting into referrals:", rErr);
    else console.log(`[3c] Inserted into referrals table. ID: ${newRef.id}`);
    
    // Insert into referral_coupons
    if (newRef) {
        const welcomeCode = 'WELCOME99-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 15);
        
        const { error: cErr } = await supabase.from('referral_coupons').insert({
            code: welcomeCode,
            user_id: newUserId,
            discount_percent: 10,
            referral_id: newRef.id,
            referrer_name: refUser.full_name || refUser.name || 'Unknown',
            referrer_email: refUser.email || 'N/A',
            referred_user_name: 'New Test User',
            referred_user_email: newUserEmail,
            expires_at: expiryDate.toISOString()
        });
        if (cErr) console.error("Error inserting into referral_coupons:", cErr);
        else console.log(`[3d] Inserted into referral_coupons table. Code: ${welcomeCode}`);
    }
  }

  // 4. Cleanup
  console.log("=== CLEANUP ===");
  await supabase.from('referrals').delete().eq('referred_user_id', newUserId);
  await supabase.from('referral_coupons').delete().eq('user_id', newUserId);
  await supabase.from('users').update({ referred_by: null }).eq('id', newUserId);
  console.log("Done.");
}

debugReferral();
