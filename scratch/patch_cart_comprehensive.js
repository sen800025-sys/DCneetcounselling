const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/web/index.html');
let html = fs.readFileSync(filePath, 'utf8');

// 1. Add .in-cart CSS
const cssToInsert = `
        .in-cart {
          background: #064e3b !important;
          color: #22c55e !important;
          border-color: #065f46 !important;
          cursor: default !important;
        }
`;
const styleEnd = html.indexOf('</style>', html.indexOf('<style>'));
if (styleEnd !== -1) {
    html = html.substring(0, styleEnd) + cssToInsert + html.substring(styleEnd);
}

// 2. Comprehensive update for Cart Logic functions
const cartLogicPatch = `
    window.showToast = function (msg) {
      var t = document.getElementById('cartToast');
      if (!t) return;
      t.textContent = msg;
      t.classList.add('show');
      setTimeout(function () { t.classList.remove('show'); }, 2500);
    };

    window.addToCart = async function (btn, ebookId) {
      if (!window._authUser) {
        alert('Please login first to add to cart.');
        window.navigate('login');
        return;
      }
      if (!window.supabaseClient) return;

      var { data } = await window.supabaseClient.from('cart').select('id').eq('user_id', window._authUser.id).eq('ebook_id', ebookId).maybeSingle();

      if (data) {
        showToast('Already in cart 🛒');
      } else {
        await window.supabaseClient.from('cart').insert({ user_id: window._authUser.id, ebook_id: ebookId });
        showToast('Added to cart 🛒');
        updateCartBadge();
      }
      
      // Refresh all buttons instantly to sync states
      if (window.loadCartStates) await window.loadCartStates();
    };

    window.addMedicalComboToCart = async function(btn) {
        if (!window._authUser) {
            alert('Please login first to add to cart.');
            window.navigate('login');
            return;
        }
        if (!window.supabaseClient) return;

        const items = ['medical_aiq', 'medical_state'];
        let addedCount = 0;

        for (const id of items) {
            const { data } = await window.supabaseClient.from('cart')
                .select('id')
                .eq('user_id', window._authUser.id)
                .eq('ebook_id', id)
                .maybeSingle();

            if (!data) {
                await window.supabaseClient.from('cart').insert({ 
                    user_id: window._authUser.id, 
                    ebook_id: id 
                });
                addedCount++;
            }
        }

        if (addedCount > 0) {
            showToast('Medical eBooks added to cart 🛒');
            updateCartBadge();
        } else {
            showToast('Already in cart 🛒');
        }
        
        // Refresh all buttons instantly to sync states
        if (window.loadCartStates) await window.loadCartStates();
    };

    window.loadCartStates = async function () {
      if (!window._authUser || !window.supabaseClient) return;
      var { data } = await window.supabaseClient.from('cart').select('ebook_id').eq('user_id', window._authUser.id);
      if (!data) return;
      var ids = data.map(function (r) { return r.ebook_id; });
      
      // Update ALL cart buttons instantly
      document.querySelectorAll('[data-ebook]').forEach(function (btn) {
        if (btn.classList.contains('ep-heart')) return; 
        var eid = btn.getAttribute('data-ebook');
        
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
    };

    window.removeFromCart = async function (btn, ebookId) {
      if (!window._authUser || !window.supabaseClient) return;
      await window.supabaseClient.from('cart').delete().eq('user_id', window._authUser.id).eq('ebook_id', ebookId);
      showToast('Removed from cart');

      // Refresh all buttons instantly to sync states
      if (window.loadCartStates) await window.loadCartStates();
      
      renderCartPage();
    };
`;

const cartLogicStartMarker = 'window.showToast = function (msg) {';
const cartLogicEndMarker = 'renderCartPage();\n    };';

const cartStartIdx = html.indexOf(cartLogicStartMarker);
const cartEndIdx = html.indexOf(cartLogicEndMarker, cartStartIdx) + cartLogicEndMarker.length;

if (cartStartIdx !== -1 && cartEndIdx !== -1) {
    html = html.substring(0, cartStartIdx) + cartLogicPatch + html.substring(cartEndIdx);
}

fs.writeFileSync(filePath, html, 'utf8');
console.log('Successfully updated cart logic with instant reset and sync');
