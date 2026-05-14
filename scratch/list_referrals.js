require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://rlqmdylbzapyepuwncwt.supabase.co', process.env.VITE_SUPABASE_ANON_KEY);
async function getReferrals() {
  const { data, error } = await supabase.from('referrals').select('*');
  console.log(data);
}
getReferrals();
