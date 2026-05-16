const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/web/index.html');
let html = fs.readFileSync(filePath, 'utf8');

// 1. Add addMedicalComboToCart function
const comboFunc = `
    window.addMedicalComboToCart = async function(btn) {
        if (!window._authUser) {
            alert('Please login first to add to cart.');
            window.navigate('login');
            return;
        }
        if (!window.supabaseClient) return;

        // Add both AIQ and State Quota
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

        btn.classList.add('in-cart');
        btn.innerHTML = '<i class="fas fa-check"></i> Added Combo';
        
        if (addedCount > 0) {
            showToast('Medical eBooks added to cart 🛒');
            updateCartBadge();
        } else {
            showToast('Already in cart 🛒');
        }
    };
`;

// Insert after addToCart function
const addToCartEnd = html.indexOf('window.addToCart = async function (btn, ebookId) {');
const nextFuncStart = html.indexOf('window.loadCartStates = async function () {');
if (addToCartEnd !== -1 && nextFuncStart !== -1) {
    // We need to find the end of addToCart
    let endOfAddToCart = html.indexOf('};', addToCartEnd) + 2;
    html = html.substring(0, endOfAddToCart) + comboFunc + html.substring(endOfAddToCart);
}

// 2. Update main Medical card button
html = html.replace(
    'onclick="event.stopPropagation(); addToCart(this, \'medical\')"',
    'onclick="event.stopPropagation(); addMedicalComboToCart(this)"'
);

// 3. Update AIQ button in options grid
// Looking for the first "Add to Cart" button in the options grid
const aiqBtnTag = '<button style="background:transparent;border:1px solid #7c3aed;color:#c4b5fd;height:36px;border-radius:8px;font-weight:600;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:10px;width:100%;" onclick="event.stopPropagation();">';
html = html.replace(aiqBtnTag, aiqBtnTag.replace('onclick="event.stopPropagation();"', 'onclick="event.stopPropagation(); addToCart(this, \'medical_aiq\')"'));

// 4. Update State Quota button in options grid (the second one)
html = html.replace(aiqBtnTag, aiqBtnTag.replace('onclick="event.stopPropagation();"', 'onclick="event.stopPropagation(); addToCart(this, \'medical_state\')"'));

fs.writeFileSync(filePath, html, 'utf8');
console.log('Successfully updated cart logic for Medical eBooks');
