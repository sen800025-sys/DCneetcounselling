const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error, count } = await supabase
    .from('college_preferences')
    .select('id', { count: 'exact' })
    .order('id', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching college preferences:', error);
  } else {
    console.log('Total Count:', count);
    console.log('Top 5 highest IDs:', data);
  }
}

run();
