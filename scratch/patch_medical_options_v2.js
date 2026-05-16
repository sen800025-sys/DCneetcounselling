const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/web/index.html');
let html = fs.readFileSync(filePath, 'utf8');

// Find the mo-grid section and replace its contents
const startMarker = '<!-- Options Grid -->';
const endMarker = '<!-- Cart Section -->';

const startIndex = html.indexOf(startMarker);
const endIndex = html.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find markers!', startIndex, endIndex);
  process.exit(1);
}

// We need to replace from startMarker to just before endMarker (keeping the closing divs)
const newGrid = `<!-- Options Grid -->
        <div class="mo-grid">

          <!-- AIQ Card -->
          <div class="mo-card scale-up"
            onclick="openEbookPurchaseModal('Medical', 'All India Quota', 199, 'Medical AIQ eBooks')">
            <div style="position: absolute; top: -1px; left: -1px; background: #FFC400; color: #000; font-size: 11px; font-weight: 800; padding: 5px 9px; border-radius: 16px 0 10px 0; z-index: 10;">50%<br>OFF</div>
            <button class="ep-heart" style="position:absolute;top:12px;right:12px;width:30px;height:30px;border-radius:50%;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.4);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;color:#fff;z-index:10;" onclick="event.stopPropagation();"><i class="far fa-heart"></i></button>

            <div class="ep-tablet-preview" style="width:55%;height:220px;border-radius:14px;background:#000;padding:6px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 15px rgba(0,0,0,0.5);margin:0 auto 14px auto;box-sizing:border-box;border:1px solid #333;">
              <div class="ep-tablet-screen" style="width:100%;height:100%;border-radius:10px;background:#f8f9fa;overflow:hidden;position:relative;display:flex;flex-direction:column;">
                <div class="ep-screen-top" style="display:flex;align-items:center;justify-content:center;gap:6px;padding:8px 8px 2px 8px;">
                  <img src="assets/logo.webp" style="width:28px;height:auto;" alt="Logo">
                  <div style="font-size:7px;font-weight:800;color:#000;line-height:1.1;">NEET<br>COUNSELLING</div>
                </div>
                <div style="padding:2px 10px 8px 10px;flex:1;display:flex;flex-direction:column;">
                  <div style="font-size:16px;font-weight:800;color:#2E0066;margin:0 0 2px 0;line-height:1.1;">ALL INDIA</div>
                  <div style="font-size:10px;font-weight:800;color:#fff;background:#4B1E88;display:inline-block;padding:2px 8px;border-radius:4px;margin-bottom:4px;width:fit-content;">AIQ - MBBS</div>
                  <div style="font-size:7px;font-weight:800;color:#2E0066;margin-bottom:4px;">COUNSELLING GUIDE eBook</div>
                  
                  <div style="text-align:left;font-size:6.5px;font-weight:700;color:#111;margin-top:auto;">
                    <div style="margin-bottom:1.5px;display:flex;align-items:center;gap:3px;"><i class="fas fa-check-circle" style="color:#2E0066;font-size:6px;"></i> 3 Years Cutoff Data Analysis</div>
                    <div style="margin-bottom:1.5px;display:flex;align-items:center;gap:3px;"><i class="fas fa-check-circle" style="color:#2E0066;font-size:6px;"></i> Category Wise</div>
                    <div style="margin-bottom:1.5px;display:flex;align-items:center;gap:3px;"><i class="fas fa-check-circle" style="color:#2E0066;font-size:6px;"></i> College Wise Cutoff</div>
                    <div style="margin-bottom:1.5px;display:flex;align-items:center;gap:3px;"><i class="fas fa-check-circle" style="color:#2E0066;font-size:6px;"></i> Govt & Deemed / Private</div>
                    <div style="margin-bottom:1.5px;display:flex;align-items:center;gap:3px;"><i class="fas fa-check-circle" style="color:#2E0066;font-size:6px;"></i> Seat Matrix</div>
                    <div style="margin-bottom:1.5px;display:flex;align-items:center;gap:3px;"><i class="fas fa-check-circle" style="color:#2E0066;font-size:6px;"></i> College Fees Structure</div>
                    <div style="margin-bottom:1.5px;display:flex;align-items:center;gap:3px;"><i class="fas fa-check-circle" style="color:#2E0066;font-size:6px;"></i> Bond Details</div>
                    <div style="margin-bottom:1.5px;display:flex;align-items:center;gap:3px;"><i class="fas fa-check-circle" style="color:#2E0066;font-size:6px;"></i> College Preference List</div>
                  </div>
                  <i class="fas fa-globe" style="position:absolute;bottom:5px;right:5px;font-size:40px;opacity:0.12;color:#2E0066;z-index:1;"></i>
                </div>
              </div>
            </div>

            <div class="ep-category-title" style="display:inline-flex;align-items:center;gap:4px;background:linear-gradient(135deg,#4B1E88,#2E0066);color:#FFC400;font-size:9px;font-weight:700;padding:3px 8px;border-radius:10px;margin-bottom:6px;border:1px solid rgba(255,196,0,0.4);width:fit-content;"><i class="fas fa-book" style="font-size:8px;"></i> eBook</div>
            
            <div style="margin: 4px 0 10px 0;">
              <div style="font-size: 13px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span style="color: #8E84A9; text-decoration: line-through;">&#8377;398</span>
                <span style="font-size: 24px; font-weight: 800; color: #FFC400;">&#8377;199</span>
              </div>
              <div style="display: inline-block; background: #064e3b; color: #22c55e; border-radius: 4px; padding: 3px 8px; font-size: 11px; font-weight: 600; margin-top: 6px;">
                You save &#8377;199
              </div>
            </div>
            
            <button class="mo-btn"
              onclick="event.stopPropagation(); openEbookPurchaseModal('Medical', 'All India Quota', 199, 'Medical AIQ eBooks')">
              <i class="fas fa-shopping-cart"></i> Buy Now at &#8377;199
            </button>
            <button style="background:transparent;border:1px solid #7c3aed;color:#c4b5fd;height:36px;border-radius:8px;font-weight:600;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:10px;width:100%;" onclick="event.stopPropagation();">
              <i class="fas fa-shopping-cart"></i> Add to Cart
            </button>
            <div style="font-size: 11px; font-weight: 600; color: #FFC400; display:flex;align-items:center;justify-content:center;gap:5px;"><i class="fas fa-hourglass-half"></i> Limited Time Offer</div>
          </div>

          <!-- State Quota Card -->
          <div class="mo-card scale-up"
            onclick="openEbookPurchaseModal('Medical', 'State Quota', 99, 'Medical State Quota eBooks')">
            <div style="position: absolute; top: -1px; left: -1px; background: #FFC400; color: #000; font-size: 11px; font-weight: 800; padding: 5px 9px; border-radius: 16px 0 10px 0; z-index: 10;">50%<br>OFF</div>
            <button class="ep-heart" style="position:absolute;top:12px;right:12px;width:30px;height:30px;border-radius:50%;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.4);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;color:#fff;z-index:10;" onclick="event.stopPropagation();"><i class="far fa-heart"></i></button>

            <div class="ep-tablet-preview" style="width:55%;height:220px;border-radius:14px;background:#000;padding:6px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 15px rgba(0,0,0,0.5);margin:0 auto 14px auto;box-sizing:border-box;border:1px solid #333;">
              <div class="ep-tablet-screen" style="width:100%;height:100%;border-radius:10px;background:#f8f9fa;overflow:hidden;position:relative;display:flex;flex-direction:column;">
                <div class="ep-screen-top" style="display:flex;align-items:center;justify-content:center;gap:6px;padding:8px 8px 2px 8px;">
                  <img src="assets/logo.webp" style="width:28px;height:auto;" alt="Logo">
                  <div style="font-size:7px;font-weight:800;color:#000;line-height:1.1;">NEET<br>COUNSELLING</div>
                </div>
                <div style="padding:2px 10px 8px 10px;flex:1;display:flex;flex-direction:column;">
                  <div style="font-size:16px;font-weight:800;color:#2E0066;margin:0 0 2px 0;line-height:1.1;">STATE</div>
                  <div style="font-size:10px;font-weight:800;color:#fff;background:#4B1E88;display:inline-block;padding:2px 8px;border-radius:4px;margin-bottom:4px;width:fit-content;">SQ - MBBS</div>
                  <div style="font-size:7px;font-weight:800;color:#2E0066;margin-bottom:4px;">COUNSELLING GUIDE eBook</div>
                  
                  <div style="text-align:left;font-size:6.5px;font-weight:700;color:#111;margin-top:auto;">
                    <div style="margin-bottom:1.5px;display:flex;align-items:center;gap:3px;"><i class="fas fa-check-circle" style="color:#2E0066;font-size:6px;"></i> 3 Years Cutoff Data Analysis</div>
                    <div style="margin-bottom:1.5px;display:flex;align-items:center;gap:3px;"><i class="fas fa-check-circle" style="color:#2E0066;font-size:6px;"></i> Category Wise</div>
                    <div style="margin-bottom:1.5px;display:flex;align-items:center;gap:3px;"><i class="fas fa-check-circle" style="color:#2E0066;font-size:6px;"></i> College Wise Cutoff</div>
                    <div style="margin-bottom:1.5px;display:flex;align-items:center;gap:3px;"><i class="fas fa-check-circle" style="color:#2E0066;font-size:6px;"></i> Govt & Deemed / Private</div>
                    <div style="margin-bottom:1.5px;display:flex;align-items:center;gap:3px;"><i class="fas fa-check-circle" style="color:#2E0066;font-size:6px;"></i> Seat Matrix</div>
                    <div style="margin-bottom:1.5px;display:flex;align-items:center;gap:3px;"><i class="fas fa-check-circle" style="color:#2E0066;font-size:6px;"></i> College Fees Structure</div>
                    <div style="margin-bottom:1.5px;display:flex;align-items:center;gap:3px;"><i class="fas fa-check-circle" style="color:#2E0066;font-size:6px;"></i> Bond Details</div>
                    <div style="margin-bottom:1.5px;display:flex;align-items:center;gap:3px;"><i class="fas fa-check-circle" style="color:#2E0066;font-size:6px;"></i> College Preference List</div>
                  </div>
                  <i class="fas fa-map" style="position:absolute;bottom:5px;right:5px;font-size:40px;opacity:0.12;color:#2E0066;z-index:1;"></i>
                </div>
              </div>
            </div>

            <div class="ep-category-title" style="display:inline-flex;align-items:center;gap:4px;background:linear-gradient(135deg,#4B1E88,#2E0066);color:#FFC400;font-size:9px;font-weight:700;padding:3px 8px;border-radius:10px;margin-bottom:6px;border:1px solid rgba(255,196,0,0.4);width:fit-content;"><i class="fas fa-book" style="font-size:8px;"></i> eBook</div>
            
            <div style="margin: 4px 0 10px 0;">
              <div style="font-size: 13px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span style="color: #8E84A9; text-decoration: line-through;">&#8377;198</span>
                <span style="font-size: 24px; font-weight: 800; color: #FFC400;">&#8377;99</span>
              </div>
              <div style="display: inline-block; background: #064e3b; color: #22c55e; border-radius: 4px; padding: 3px 8px; font-size: 11px; font-weight: 600; margin-top: 6px;">
                You save &#8377;99
              </div>
            </div>
            
            <button class="mo-btn"
              onclick="event.stopPropagation(); openEbookPurchaseModal('Medical', 'State Quota', 99, 'Medical State Quota eBooks')">
              <i class="fas fa-shopping-cart"></i> Buy Now at &#8377;99
            </button>
            <button style="background:transparent;border:1px solid #7c3aed;color:#c4b5fd;height:36px;border-radius:8px;font-weight:600;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:10px;width:100%;" onclick="event.stopPropagation();">
              <i class="fas fa-shopping-cart"></i> Add to Cart
            </button>
            <div style="font-size: 11px; font-weight: 600; color: #FFC400; display:flex;align-items:center;justify-content:center;gap:5px;"><i class="fas fa-hourglass-half"></i> Limited Time Offer</div>
          </div>

        </div>
      </div>
    </div>

`;

// Replace from startMarker to endMarker (not including endMarker)
let newHtml = html.substring(0, startIndex) + newGrid + html.substring(endIndex);
fs.writeFileSync(filePath, newHtml, 'utf8');
console.log('Medical options upgraded with tablet previews!');
