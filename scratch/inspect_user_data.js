const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = 'https://rlqmdylbzapyepuwncwt.supabase.co';
const key = process.env.SUPABASE_ANON_KEY;

if (!key) {
  console.error("Error: SUPABASE_ANON_KEY is not defined.");
  process.exit(1);
}

const supabase = createClient(url, key);

async function inspectData() {
  try {
    console.log('=== Recent rows in preference_maker_users ===');
    const { data: pmUsers, error: pmErr } = await supabase
      .from('preference_maker_users')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(10);

    if (pmErr) throw pmErr;
    console.log(JSON.stringify(pmUsers, null, 2));

    console.log('\n=== Recent rows in users ===');
    const { data: users, error: usersErr } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (usersErr) throw usersErr;
    console.log(JSON.stringify(users, null, 2));

  } catch (err) {
    console.error("Error:", err.message);
  }
}

inspectData();
