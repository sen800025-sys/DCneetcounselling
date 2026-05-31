const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscW1keWxiemFweWVwdXduY3d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNTcwNzYsImV4cCI6MjA5MTgzMzA3Nn0.oNNK1pwLnykQlNfUkw7IdB-ZBkKDoWxszsKDSIjsLeo";
const backendUrl = "https://rlqmdylbzapyepuwncwt.supabase.co/functions/v1/razorpay-payment";

async function run() {
  try {
    const payload = {
      email: "test@example.com",
      full_name: "Test Student",
      mobile: "9876543210",
      product_name: "Premium Preference Maker",
      amount: 1.00,
      coupon: null,
      user_id: "3cf2c5d7-4b44-4dcc-a6fc-70b22053fdba",
      wallet_enabled: false,
      counselling_type: "preference_maker"
    };

    console.log("Sending payload:", payload);

    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": anonKey,
        "Authorization": `Bearer ${anonKey}`
      },
      body: JSON.stringify(payload)
    });

    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response Body:", text);
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
