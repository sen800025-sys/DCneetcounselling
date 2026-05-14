require('dotenv').config();
// Use native fetch

async function testVerify() {
  const order_id = 'cedca9f8-5dbb-40a7-805d-8e959c377422'; // The pending order from database
  const BACKEND_URL = 'https://rlqmdylbzapyepuwncwt.supabase.co/functions/v1';
  
  console.log("Attempting to verify order:", order_id);
  
  const res = await fetch(`${BACKEND_URL}/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: order_id,
      // Leaving razorpay params null so it skips signature check for this debug run
      // (This only works if the function allows skipping signature when params are missing)
    })
  });
  
  const data = await res.json();
  console.log("Response:", data);
}

testVerify();
