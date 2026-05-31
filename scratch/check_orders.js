const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = 'https://rlqmdylbzapyepuwncwt.supabase.co';
const key = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function checkOrders() {
  console.log('Querying orders...');
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching orders:', error.message);
    return;
  }
  
  console.log(`Found ${orders.length} orders:`);
  for (const o of orders) {
    console.log(`- ID: ${o.id} | Email: ${o.email} | Mobile: ${o.mobile} | Product: ${o.product_name} | Paid: ${o.amount_paid} | Status: ${o.payment_status} | Mode: ${o.payment_mode}`);
  }
}

checkOrders();
