require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://rlqmdylbzapyepuwncwt.supabase.co', process.env.VITE_SUPABASE_ANON_KEY);
async function getCoupons() {
  const { data, error } = await supabase.from('coupons').select('*').limit(5);
  console.log(data, error);
}
getCoupons();
