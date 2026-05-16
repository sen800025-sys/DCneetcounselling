const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/web/index.html');
let html = fs.readFileSync(filePath, 'utf8');

const oldLoadFuncStart = 'window.loadCartStates = async function () {';
const oldLoadFuncEnd = 'updateCartBadge(ids.length);\n    };';

const newLoadFunc = `window.loadCartStates = async function () {
      if (!window._authUser || !window.supabaseClient) return;
      var { data } = await window.supabaseClient.from('cart').select('ebook_id').eq('user_id', window._authUser.id);
      if (!data) return;
      var ids = data.map(function (r) { return r.ebook_id; });
      
      // Update ALL cart buttons instantly
      document.querySelectorAll('[data-ebook]').forEach(function (btn) {
        if (btn.classList.contains('ep-heart')) return; // skip wishlist heart
        var eid = btn.getAttribute('data-ebook');
        
        // Medical combo special case: active only if both are in cart
        if (eid === 'medical') {
            if (ids.indexOf('medical_aiq') > -1 && ids.indexOf('medical_state') > -1) {
                btn.classList.add('in-cart');
                btn.innerHTML = '<i class="fas fa-check"></i> Added Combo';
            } else {
                btn.classList.remove('in-cart');
                btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
            }
        } else if (ids.indexOf(eid) > -1) {
          btn.classList.add('in-cart');
          btn.innerHTML = '<i class="fas fa-check"></i> In Cart';
        } else {
          btn.classList.remove('in-cart');
          btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
        }
      });
      updateCartBadge(ids.length);
    };`;

const startIdx = html.indexOf(oldLoadFuncStart);
const endIdx = html.indexOf(oldLoadFuncEnd, startIdx) + oldLoadFuncEnd.length;

if (startIdx !== -1 && endIdx !== -1) {
    html = html.substring(0, startIdx) + newLoadFunc + html.substring(endIdx);
}

fs.writeFileSync(filePath, html, 'utf8');
console.log('Successfully updated loadCartStates for all button types');
