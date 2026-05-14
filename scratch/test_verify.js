// Quick smoke test: verify-payment should return a proper JSON error for a fake order
fetch("https://rlqmdylbzapyepuwncwt.supabase.co/functions/v1/verify-payment", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ 
    order_id: "fake-test-id",
    razorpay_payment_id: "pay_test123",
    razorpay_order_id: "order_test123",
    razorpay_signature: "fakesig"
  })
}).then(async r => {
  console.log("Status:", r.status);
  console.log("Body:", await r.text());
}).catch(console.error);
