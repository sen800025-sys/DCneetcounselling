const fs = require('fs');
const indexPath = 'c:\\Users\\rushi\\Downloads\\DCneetcounselling\\frontend\\web\\index.html';

let content = fs.readFileSync(indexPath, 'utf8');

// Replace the segmented category buttons with a text input
const oldCategory = `<!-- Category -->
      <div class="plp-input-group plp-category-wrap">
        <label>Category</label>
        <div class="plp-category-btns" id="plpCategoryBtns">
          <button type="button" class="plp-cat-btn active" data-cat="General">General</button>
          <button type="button" class="plp-cat-btn" data-cat="OBC">OBC</button>
          <button type="button" class="plp-cat-btn" data-cat="EWS">EWS</button>
          <button type="button" class="plp-cat-btn" data-cat="SC">SC</button>
          <button type="button" class="plp-cat-btn" data-cat="ST">ST</button>
        </div>
        <input type="hidden" id="plpCategory" value="General">
      </div>`;

const newCategory = `<!-- Category -->
      <div class="plp-input-group">
        <label>Category</label>
        <input type="text" class="plp-input" id="plpCategory" placeholder="e.g. General, OBC, EWS, SC, ST" required>
        <div class="plp-error" id="plpCatErr">Please enter your category</div>
      </div>`;

if (content.includes(oldCategory)) {
  content = content.replace(oldCategory, newCategory);
  console.log('Replaced category buttons with text input.');
} else {
  console.log('Old category block not found exactly. Trying partial...');
  // Try partial match
  if (content.includes('plp-category-btns')) {
    const catStart = content.indexOf('<!-- Category -->');
    const catEnd = content.indexOf('<!-- Mobile Number -->');
    if (catStart !== -1 && catEnd !== -1) {
      content = content.substring(0, catStart) + newCategory + '\n\n      ' + content.substring(catEnd);
      console.log('Replaced via partial match.');
    }
  }
}

// Remove the old category button JS (catBtns click handler)
const oldCatJS = `// Category selector
  catBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      catBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      document.getElementById('plpCategory').value = btn.getAttribute('data-cat');
    });
  });`;

if (content.includes(oldCatJS)) {
  content = content.replace(oldCatJS, '');
  console.log('Removed old category JS.');
}

// Remove catBtns variable declaration
content = content.replace("const catBtns = document.querySelectorAll('.plp-cat-btn');\n", '');

// Update form validation to include category text input
const oldValidation = `return valid;
  }`;

// Add category validation - find the right one in the popup script
const mobileErrLine = `if (!mobile.value || mobile.value.length !== 10) {
      mobileErr.classList.add('show');
      valid = false;
    }
    return valid;`;

const newValidation = `if (!mobile.value || mobile.value.length !== 10) {
      mobileErr.classList.add('show');
      valid = false;
    }
    
    var category = document.getElementById('plpCategory');
    var catErr = document.getElementById('plpCatErr');
    if (catErr) catErr.classList.remove('show');
    if (category && !category.value.trim()) {
      if (catErr) catErr.classList.add('show');
      valid = false;
    }
    return valid;`;

if (content.includes(mobileErrLine)) {
  content = content.replace(mobileErrLine, newValidation);
  console.log('Updated validation for category.');
}

fs.writeFileSync(indexPath, content, 'utf8');
console.log('Done! Category is now a manual text input.');
