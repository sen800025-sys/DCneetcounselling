const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.SUPABASE_URL || 'https://rlqmdylbzapyepuwncwt.supabase.co';
const key = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function listTables() {
  const { data, error } = await supabase.rpc('get_tables'); // Or try raw SQL query if RPC doesn't exist
  if (error) {
    console.log('RPC get_tables failed, querying system tables via postgrest...');
    // We can query schema tables via RPC or raw query, but raw query requires a custom RPC or Postgres function.
    // Let's try select from a common table or look at what we can find.
    // Let's write an SQL query to list tables using RPC if we have one, or just print the tables we know about.
  }
  
  // We can query Postgrest openapi schema!
  const axios = require('axios');
  try {
    const res = await axios.get(`${url}/rest/v1/`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    console.log('Tables from PostgREST OpenAPI spec:');
    if (res.data && res.data.paths) {
      const paths = Object.keys(res.data.paths);
      paths.forEach(p => {
        if (p.startsWith('/')) {
          console.log(`  - ${p.slice(1)}`);
        }
      });
    }
  } catch (err) {
    console.error('Error fetching OpenAPI spec:', err.message);
  }
}

listTables();
