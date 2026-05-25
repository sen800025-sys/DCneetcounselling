const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://anqqmulbmeydetwpeudh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFucXFtdWxibWV5ZGV0d3BldWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzODY1MTMsImV4cCI6MjA5Mzk2MjUxM30.AbfUID7hy1gg88C_j0OUk09G0XEW8uEqvJzD17u96ZA'
);

async function testPredictorLeadsTable() {
  console.log("--- Supabase Diagnostic on Testing DB ---");

  const { data: leads, error: leadsErr } = await supabase
    .from('dc_rank_predictor_leads')
    .select('*')
    .limit(5);

  if (leadsErr) {
    console.error("❌ Error querying 'dc_rank_predictor_leads':", leadsErr.message);
  } else {
    console.log("✅ Table 'dc_rank_predictor_leads' exists on Testing DB!");
    console.log(`Found ${leads.length} records:`, leads);
  }
}

testPredictorLeadsTable();
