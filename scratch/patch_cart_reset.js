const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/web/index.html');
let html = fs.readFileSync(filePath, 'utf8');

// 1. Update AIQ button in options grid to have data-ebook and a class
const aiqBtnTag = 'onclick="event.stopPropagation(); addToCart(this, \'medical_aiq\')"';
html = html.replace(aiqBtnTag, aiqBtnTag + ' data-ebook="medical_aiq" class="ec-cart-btn"');

// 2. Update State Quota button in options grid
const sqBtnTag = 'onclick="event.stopPropagation(); addToCart(this, \'medical_state\')"';
html = html.replace(sqBtnTag, sqBtnTag + ' data-ebook="medical_state" class="ec-cart-btn"');

// 3. Update removeFromCart function
const oldRemoveFuncStart = 'window.removeFromCart = async function (btn, ebookId) {';
const oldRemoveFuncEnd = 'renderCartPage();\n    };';

const newRemoveFunc = `window.removeFromCart = async function (btn, ebookId) {
      if (!window._authUser || !window.supabaseClient) return;
      await window.supabaseClient.from('cart').delete().eq('user_id', window._authUser.id).eq('ebook_id', ebookId);
      showToast('Removed from cart');

      // Reset all related buttons instantly
      document.querySelectorAll('[data-ebook="' + ebookId + '"]').forEach(function (b) {
        if (b.classList.contains('ep-heart')) return; // skip wishlist heart
        b.classList.remove('in-cart');
        b.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
      });

      // Special handling for medical combo button
      if (ebookId === 'medical_aiq' || ebookId === 'medical_state') {
          const mainMedBtn = document.querySelector('.ep-btn-secondary[data-ebook="medical"]');
          if (mainMedBtn) {
              mainMedBtn.classList.remove('in-cart');
              mainMedBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
          }
      }

      updateCartBadge();
      renderCartPage();
    };`;

const startIdx = html.indexOf(oldRemoveFuncStart);
const endIdx = html.indexOf(oldRemoveFuncEnd, startIdx) + oldRemoveFuncEnd.length;

if (startIdx !== -1 && endIdx !== -1) {
    html = html.substring(0, startIdx) + newRemoveFunc + html.substring(endIdx);
}

fs.writeFileSync(filePath, html, 'utf8');
console.log('Successfully updated removeFromCart and added data-ebook to buttons');
