require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: "*"
}));
app.use(express.json());

// Routes
const paymentRoutes = require('./src/routes/payment');
const ordersRoutes = require('./src/routes/orders');
const counselingRoutes = require('./src/routes/counseling');
const couponsRoutes = require('./src/routes/coupons');
const affiliatesRoutes = require('./src/routes/affiliates');

app.use('/api', paymentRoutes);
app.use('/api', couponsRoutes);
app.use('/api', affiliatesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/submit-counseling-booking', counselingRoutes);

// Basic health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Explicit Tracking Route
app.post('/api/track-order', async (req, res) => {
  try {
    const { order_id, amount, coupon } = req.body;

    console.log('📩 Incoming:', { order_id, amount, coupon });

    const response = await fetch('https://dcneetcounselling.goaffpro.com/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ order_id, amount, coupon })
    });

    const text = await response.text();
    console.log('GoAffPro response:', text);

    res.json({ success: true });

  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Explicit Validate Coupon Route
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.post('/api/validate-coupon', async (req, res) => {
  try {
    const coupon = req.body.coupon?.trim().toUpperCase();
    console.log("Incoming coupon:", coupon);

    if (!coupon) {
      return res.json({ valid: false, message: 'Please enter a coupon code' });
    }

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .ilike('coupon_code', coupon);

    if (error) {
      console.error("Supabase query error:", error);
      return res.status(500).json({ valid: false, message: 'Database error' });
    }

    if (data && data.length > 0) {
      const c = data[0];

      // Check if coupon is active
      if (c.is_active === false) {
        return res.json({ valid: false, message: 'This coupon is no longer active' });
      }

      // Check validity dates
      const now = new Date();
      if (c.valid_from && now < new Date(c.valid_from)) {
        return res.json({ valid: false, message: 'Coupon is not yet valid' });
      }
      if (c.valid_to && now > new Date(c.valid_to)) {
        return res.json({ valid: false, message: 'Coupon has expired' });
      }

      // Check usage limit
      if (c.usage_limit !== null && c.used_count >= c.usage_limit) {
        return res.json({ valid: false, message: 'Coupon usage limit reached' });
      }

      return res.json({
        valid: true,
        discount_type: c.discount_type,
        discount_value: parseFloat(c.discount_value),
        goaffpro_ref: c.goaffpro_ref || null,
        min_order_amount: c.min_order_amount || null
      });
    }

    return res.json({ valid: false, message: 'Invalid Coupon' });
  } catch (err) {
    console.error("Validate Coupon Error:", err);
    return res.status(500).json({ valid: false, message: "Internal server error" });
  }
});

// Sync Affiliates Route
app.get('/api/sync-affiliates', async (req, res) => {
  try {
    const response = await fetch('https://api.goaffpro.com/v1/admin/affiliates', {
      headers: {
        'x-goaffpro-access-token': process.env.GOAFFPRO_TOKEN
      }
    });
    
    if (!response.ok) {
      throw new Error(`GoAffPro API returned ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const affiliates = data.affiliates || [];
    
    let inserted = 0;
    for (const aff of affiliates) {
      // Map properties based on typical GoAffPro response
      const goaffproId = aff.id;
      const username = aff.refcode || aff.username || aff.referral_code || '';
      const email = aff.email || '';
      
      if (!goaffproId) continue;

      const { error } = await supabase
        .from('affiliates')
        .upsert({
          goaffpro_id: goaffproId,
          username: username,
          email: email
        }, { onConflict: 'goaffpro_id' });
        
      if (!error) inserted++;
    }

    res.json({ success: true, count: inserted });
  } catch (err) {
    console.error('❌ Sync Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server (only if not running in a serverless environment like Vercel)
if (process.env.NODE_ENV !== 'production' || process.env.RENDER) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Backend server is running on port ${PORT} (exposed to network)`);
    });
}

// Export for Vercel
module.exports = app;
