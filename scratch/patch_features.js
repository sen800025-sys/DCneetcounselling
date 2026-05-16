const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/web/index.html');
let html = fs.readFileSync(filePath, 'utf8');

const oldFeatures = `<div class="ep-features">
                  <div><i class="fas fa-check-circle"></i> Counselling Rules & Guide</div>
                  <div><i class="fas fa-check-circle"></i> Previous Year Cutoffs</div>
                  <div><i class="fas fa-check-circle"></i> Participating Institute List</div>
                  <div><i class="fas fa-check-circle"></i> FAQs & Important Info</div>
                </div>`;

const newFeatures = `<div class="ep-features">
                  <div><i class="fas fa-check-circle"></i> 3 Years Cutoff Data Analysis</div>
                  <div><i class="fas fa-check-circle"></i> Category Wise</div>
                  <div><i class="fas fa-check-circle"></i> College Wise Cutoff</div>
                  <div><i class="fas fa-check-circle"></i> Govt & Deemed / Private</div>
                  <div><i class="fas fa-check-circle"></i> Seat Matrix</div>
                  <div><i class="fas fa-check-circle"></i> College Fees Structure</div>
                  <div><i class="fas fa-check-circle"></i> Bond Details</div>
                  <div><i class="fas fa-check-circle"></i> College Preference List</div>
                </div>`;

const count = html.split(oldFeatures).length - 1;
console.log('Found', count, 'matches');

html = html.split(oldFeatures).join(newFeatures);

fs.writeFileSync(filePath, html, 'utf8');
console.log('All feature lists updated successfully!');
