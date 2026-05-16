const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/web/index.html');
let html = fs.readFileSync(filePath, 'utf8');

// Find medical options section
const startTag = '<div id="section-medical-options"';
const endTag = '<!-- Cart Section -->';

const startIndex = html.indexOf(startTag);
const endIndex = html.indexOf(endTag);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find markers! start:', startIndex, 'end:', endIndex);
  process.exit(1);
}

const newSection = `<div id="section-medical-options" class="page-section" style="
          background: #0B0014;
          padding: 20px;
          font-family: 'Poppins', var(--font-main);
          min-height: 100vh;
          display: none;
        ">
      <style>
        .mo-grid {
          display: grid;
          gap: 20px;
          grid-template-columns: 1fr;
        }

        @media (min-width: 768px) {
          .mo-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .mo-card {
          background: transparent;
          border: 1.5px solid #FFC400;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          position: relative;
        }

        .mo-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 0 25px rgba(255, 196, 0, 0.3);
        }

        .mo-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          background: rgba(255, 196, 0, 0.1);
          border: 1px solid rgba(255, 196, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          margin-bottom: 16px;
        }

        #app-root .mo-title {
          font-size: 20px;
          font-weight: 800;
          color: #ffffff !important;
          margin: 0 0 6px 0;
        }

        #app-root .mo-subtitle {
          font-size: 14px;
          color: #D2C6E8 !important;
          margin: 0 0 16px 0;
        }

        .mo-highlight {
          font-size: 12px;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 20px;
          margin-bottom: 20px;
        }

        .mo-btn {
          margin-top: auto;
          width: 100%;
          padding: 14px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 16px;
          border: none;
          color: #000000;
          cursor: pointer;
          transition: filter 0.2s;
          background: #FFC400;
        }

        .mo-btn:hover {
          filter: brightness(1.1);
        }

        .mo-price {
          font-size: 12px;
          font-weight: 600;
          color: #16a34a !important;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
      </style>

      <div style="
            max-width: 800px;
            margin: 0 auto;
            padding-top: 80px;
            padding-bottom: 80px;
            text-align: center;
          ">
        <!-- Back Button -->
        <div style="text-align: left; margin-bottom: 20px;">
          <button onclick="window.navigate('ebooks')"
            style="background: transparent; border: none; color: #FFC400; font-size: 16px; cursor: pointer; font-family: inherit; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
            <i class="fas fa-arrow-left"></i> Back to eBooks
          </button>
        </div>

        <!-- Header -->
        <div style="margin-bottom: 40px;">
          <h2 style="font-size: 32px; font-weight: 800; color: #ffffff !important; margin: 0 0 8px 0;">Medical eBooks</h2>
          <p style="font-size: 16px; color: #D2C6E8; margin: 0; font-weight: 500;">Select Quota Type</p>
        </div>

        <!-- Options Grid -->
        <div class="mo-grid">

          <!-- AIQ Card -->
          <div class="mo-card scale-up"
            onclick="openEbookPurchaseModal('Medical', 'All India Quota', 199, 'Medical AIQ eBooks')">
            <div style="position: absolute; top: -1px; left: -1px; background: #FFC400; color: #000; font-size: 11px; font-weight: 800; padding: 5px 9px; border-radius: 16px 0 10px 0; z-index: 10;">50%<br>OFF</div>
            <div class="mo-icon" style="color: #FFC400;">
              <i class="fas fa-globe"></i>
            </div>
            <h3 class="mo-title">All India Quota</h3>
            <p class="mo-subtitle">15% AIQ Counselling</p>
            
            <div style="margin: 8px 0 12px 0;">
              <div style="font-size: 13px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span style="color: #8E84A9; text-decoration: line-through;">&#8377;398</span>
                <span style="font-size: 24px; font-weight: 800; color: #FFC400;">&#8377;199</span>
              </div>
              <div style="display: inline-block; background: #064e3b; color: #22c55e; border-radius: 4px; padding: 3px 8px; font-size: 11px; font-weight: 600; margin-top: 6px;">
                You save &#8377;199
              </div>
            </div>
            <div class="mo-highlight" style="background: rgba(255, 196, 0, 0.1); color: #FFC400; border: 1px solid rgba(255, 196, 0, 0.3); margin-bottom: 16px;">
              Top Colleges Included
            </div>
            
            <button class="mo-btn"
              onclick="event.stopPropagation(); openEbookPurchaseModal('Medical', 'All India Quota', 199, 'Medical AIQ eBooks')">
              <i class="fas fa-shopping-cart"></i> Buy Now at &#8377;199
            </button>
            <div style="font-size: 11px; font-weight: 600; color: #FFC400; margin-top: 12px;"><i class="fas fa-hourglass-half"></i> Limited Time Offer</div>
          </div>

          <!-- State Quota Card -->
          <div class="mo-card scale-up"
            onclick="openEbookPurchaseModal('Medical', 'State Quota', 99, 'Medical State Quota eBooks')">
            <div style="position: absolute; top: -1px; left: -1px; background: #FFC400; color: #000; font-size: 11px; font-weight: 800; padding: 5px 9px; border-radius: 16px 0 10px 0; z-index: 10;">50%<br>OFF</div>
            <div class="mo-icon" style="color: #22c55e;">
              <i class="fas fa-map"></i>
            </div>
            <h3 class="mo-title">State Quota</h3>
            <p class="mo-subtitle">85% State Counselling</p>
            
            <div style="margin: 8px 0 12px 0;">
              <div style="font-size: 13px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span style="color: #8E84A9; text-decoration: line-through;">&#8377;198</span>
                <span style="font-size: 24px; font-weight: 800; color: #FFC400;">&#8377;99</span>
              </div>
              <div style="display: inline-block; background: #064e3b; color: #22c55e; border-radius: 4px; padding: 3px 8px; font-size: 11px; font-weight: 600; margin-top: 6px;">
                You save &#8377;99
              </div>
            </div>
            <div class="mo-highlight" style="background: rgba(255, 196, 0, 0.1); color: #FFC400; border: 1px solid rgba(255, 196, 0, 0.3); margin-bottom: 16px;">
              State-wise Detailed Data
            </div>
            
            <button class="mo-btn"
              onclick="event.stopPropagation(); openEbookPurchaseModal('Medical', 'State Quota', 99, 'Medical State Quota eBooks')">
              <i class="fas fa-shopping-cart"></i> Buy Now at &#8377;99
            </button>
            <div style="font-size: 11px; font-weight: 600; color: #FFC400; margin-top: 12px;"><i class="fas fa-hourglass-half"></i> Limited Time Offer</div>
          </div>

        </div>
      </div>
    </div>

`;

let newHtml = html.substring(0, startIndex) + newSection + html.substring(endIndex);
fs.writeFileSync(filePath, newHtml, 'utf8');
console.log('Medical options section upgraded successfully!');
