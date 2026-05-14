fetch("https://rlqmdylbzapyepuwncwt.supabase.co/functions/v1/validate-coupon", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ coupon_code: "EARLY20", plan_price: 1000 })
}).then(async r => {
  console.log(r.status);
  console.log(await r.text());
}).catch(console.error);
