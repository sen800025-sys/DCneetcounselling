const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/web/index.html');
let html = fs.readFileSync(filePath, 'utf8');

// Replace AIQ price block with ep-style price row
const oldAiqPrice = `<div style="margin: 4px 0 10px 0;">
              <div style="font-size: 13px; font-weight: 600; display: flex; align-items: baseline; gap: 8px;">
                <span style="color: #8E84A9; text-decoration: line-through;">&#8377;398</span>
                <span style="font-size: 24px; font-weight: 800; color: #FFC400;">&#8377;199</span>
              </div>
              <div style="display: inline-block; background: #064e3b; color: #22c55e; border-radius: 4px; padding: 3px 8px; font-size: 11px; font-weight: 600; margin-top: 6px;">
                You save &#8377;199
              </div>
            </div>`;

const newAiqPrice = `<div class="ep-price-row" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;width:100%;">
              <div class="ep-prices" style="display:flex;align-items:baseline;gap:8px;">
                <span class="ep-old-price" style="font-size:14px;font-weight:500;color:#6b7280;text-decoration:line-through;">&#8377;398</span>
                <span class="ep-new-price" style="font-size:24px;font-weight:800;color:#FFC400;line-height:1;">&#8377;199</span>
              </div>
              <div class="ep-save-box" style="background:#064e3b;color:#22c55e;border-radius:4px;padding:3px 6px;font-size:10px;font-weight:600;">You Save &#8377;199</div>
            </div>`;

html = html.replace(oldAiqPrice, newAiqPrice);

// Replace State price block
const oldSqPrice = `<div style="margin: 4px 0 10px 0;">
              <div style="font-size: 13px; font-weight: 600; display: flex; align-items: baseline; gap: 8px;">
                <span style="color: #8E84A9; text-decoration: line-through;">&#8377;198</span>
                <span style="font-size: 24px; font-weight: 800; color: #FFC400;">&#8377;99</span>
              </div>
              <div style="display: inline-block; background: #064e3b; color: #22c55e; border-radius: 4px; padding: 3px 8px; font-size: 11px; font-weight: 600; margin-top: 6px;">
                You save &#8377;99
              </div>
            </div>`;

const newSqPrice = `<div class="ep-price-row" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;width:100%;">
              <div class="ep-prices" style="display:flex;align-items:baseline;gap:8px;">
                <span class="ep-old-price" style="font-size:14px;font-weight:500;color:#6b7280;text-decoration:line-through;">&#8377;198</span>
                <span class="ep-new-price" style="font-size:24px;font-weight:800;color:#FFC400;line-height:1;">&#8377;99</span>
              </div>
              <div class="ep-save-box" style="background:#064e3b;color:#22c55e;border-radius:4px;padding:3px 6px;font-size:10px;font-weight:600;">You Save &#8377;99</div>
            </div>`;

html = html.replace(oldSqPrice, newSqPrice);

// Replace Add to Cart buttons with ep-btn-secondary style
const oldCartBtn = `<button style="background:transparent;border:1px solid #7c3aed;color:#c4b5fd;height:36px;border-radius:8px;font-weight:600;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:10px;width:100%;" onclick="event.stopPropagation();">
              <i class="fas fa-shopping-cart"></i> Add to Cart
            </button>`;

const newCartBtn = `<button class="ep-btn-secondary" style="background:transparent;border:1px solid #7c3aed;color:#c4b5fd;height:36px;border-radius:8px;font-weight:600;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:10px;width:100%;" onclick="event.stopPropagation();">
              <i class="fas fa-shopping-cart"></i> Add to Cart
            </button>`;

// Replace footer text alignment
html = html.split('font-size: 11px; font-weight: 600; color: #FFC400; display:flex;align-items:center;justify-content:center;gap:5px;')
  .join('font-size: 11px; font-weight: 500; color: #FFC400; display:flex;align-items:center;justify-content:center;gap:5px;');

fs.writeFileSync(filePath, html, 'utf8');
console.log('Price rows updated to match main ebook layout!');
