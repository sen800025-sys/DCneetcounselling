const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/web/index.html');
let html = fs.readFileSync(filePath, 'utf8');

// Fix AIQ card price row: center -> left aligned, use ep-price-row pattern
html = html.replace(
  /(<div class="mo-card scale-up"\s*\n\s*onclick="openEbookPurchaseModal\('Medical', 'All India Quota'.*?<\/div>\s*\n\s*<\/div>)\s*\n\s*<\/div>/s,
  (match) => {
    // Replace center-aligned price with left-aligned ep-style
    let fixed = match;
    // Fix price display: center -> flex-start
    fixed = fixed.replace(
      /display: flex; align-items: center; justify-content: center; gap: 8px;/g,
      'display: flex; align-items: baseline; gap: 8px;'
    );
    // Fix save box: center -> left
    fixed = fixed.replace(
      /display: inline-block; background: #064e3b/g,
      'display: inline-block; background: #064e3b'
    );
    return fixed;
  }
);

// Fix State Quota card the same way
html = html.replace(
  /(<div class="mo-card scale-up"\s*\n\s*onclick="openEbookPurchaseModal\('Medical', 'State Quota'.*?<\/div>\s*\n\s*<\/div>)\s*\n\s*<\/div>/s,
  (match) => {
    let fixed = match;
    fixed = fixed.replace(
      /display: flex; align-items: center; justify-content: center; gap: 8px;/g,
      'display: flex; align-items: baseline; gap: 8px;'
    );
    return fixed;
  }
);

// Change tablet preview to use align-self: center so only tablet is centered, rest is left
html = html.replace(
  /margin:0 auto 14px auto;box-sizing:border-box;border:1px solid #333;/g,
  'margin:0 auto 12px auto;box-sizing:border-box;border:1px solid #333;align-self:center;'
);

// Make Limited Time Offer left-aligned on medical options cards too
// These have inline justify-content:center, change to flex-start
// Actually let's keep these centered since they look good centered

fs.writeFileSync(filePath, html, 'utf8');
console.log('Medical options text alignment updated!');
