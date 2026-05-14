fetch("https://rlqmdylbzapyepuwncwt.supabase.co/functions/v1/razorpay-payment", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ 
      amount: 1000, 
      coupon: "EARLY20",
      email: "test@example.com",
      full_name: "Test User",
      mobile: "1234567890",
      product_name: "Test Product"
  })
}).then(async r => {
  console.log(r.status);
  console.log(await r.text());
}).catch(console.error);
