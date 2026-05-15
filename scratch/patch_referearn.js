const fs = require('fs');

const path = 'c:\\Users\\rushi\\Downloads\\DCneetcounselling\\frontend\\admin\\src\\pages\\profile\\ReferEarn.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add imports
content = content.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { supabase } from '../../supabaseClient';");

// 2. Add state and fetch logic
const hookStart = `export default function ReferEarn() {
  const [copied, setCopied] = useState(false);`;

const newLogic = `export default function ReferEarn() {
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState({ total: 0, successful: 0, pending: 0, wallet: 0 });
  const [referralToken, setReferralToken] = useState("loading...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session || !session.session) return;
      const user = session.session.user;

      // Get user's referral token
      const { data: profile } = await supabase.from('users').select('referral_token').eq('id', user.id).single();
      if (profile && profile.referral_token) {
        setReferralToken(profile.referral_token);
      } else {
        setReferralToken(user.id.substring(0, 8)); // fallback
      }

      // Query tracking registrations directly using provider dashboard query
      const { data: referralData, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setReferrals(referralData || []);
      
      // Update Live Stats
      const total = referralData ? referralData.length : 0;
      const successful = referralData ? referralData.filter(r => r.status === 'purchased').length : 0;
      const pending = total - successful;
      const wallet = successful * 450; // Dynamic wallet calc
      
      setStats({ total, successful, pending, wallet });
    } catch(err) {
      console.error('Error fetching referral data:', err);
    } finally {
      setLoading(false);
    }
  };`;

content = content.replace(hookStart, newLogic);

// 3. Update variables
content = content.replace('const referralLink = "https://yourdomain.com/signup?ref=demo123";', 'const referralLink = `https://dcneetcounselling.com/?ref=${referralToken}`;');

content = content.replace('value="₹450"', 'value={`₹${stats.wallet}`}');
content = content.replace('value="12"', 'value={stats.successful.toString()}');
content = content.replace('value="₹2,450"', 'value={`₹${stats.wallet}`}');

// 4. Update the hardcoded HistoryRows
const historyBlock = `<HistoryRow name="Rahul Sharma" status="Purchased" amount="₹199" type="success" />
                  <HistoryRow name="Priya Patel" status="Joined" amount="Pending" type="pending" />
                  <HistoryRow name="Aman Singh" status="Purchased" amount="₹299" type="success" />`;

const newHistoryBlock = `{loading ? (
                    <tr><td colSpan="3" className="py-8 text-center text-slate-500">Loading tracking data...</td></tr>
                  ) : referrals.length === 0 ? (
                    <tr><td colSpan="3" className="py-8 text-center text-slate-500">No referrals found yet. Share your link!</td></tr>
                  ) : (
                    referrals.map((ref, idx) => (
                      <HistoryRow 
                        key={idx} 
                        name={ref.referred_user_name || ref.referred_user_email || 'Anonymous Student'} 
                        status={ref.status === 'purchased' ? 'Purchased' : 'Joined'} 
                        amount={ref.status === 'purchased' ? '₹450' : 'Pending'} 
                        type={ref.status === 'purchased' ? 'success' : 'pending'} 
                      />
                    ))
                  )}`;

content = content.replace(historyBlock, newHistoryBlock);

fs.writeFileSync(path, content, 'utf8');
console.log('ReferEarn patched successfully!');
