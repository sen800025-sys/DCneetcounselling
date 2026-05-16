const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/web/index.html');
let html = fs.readFileSync(filePath, 'utf8');

// Identify the Medical Options section area
const startSection = '<div id="section-medical-options"';
const endSection = '<!-- Cart Section -->';
const sectionStartIdx = html.indexOf(startSection);
const sectionEndIdx = html.indexOf(endSection);

if (sectionStartIdx === -1 || sectionEndIdx === -1) {
    console.error('Medical options section not found');
    process.exit(1);
}

let sectionHtml = html.substring(sectionStartIdx, sectionEndIdx);

// Apply text size increases
// 1. Logo image
sectionHtml = sectionHtml.replace(/width:28px;height:auto;/g, 'width:32px;height:auto;');
// 2. Logo text
sectionHtml = sectionHtml.replace(/font-size:7px;font-weight:800;color:#000;line-height:1.1;/g, 'font-size:8.5px;font-weight:800;color:#000;line-height:1.1;');
// 3. Screen Main Title (ALL INDIA / STATE)
sectionHtml = sectionHtml.replace(/font-size:16px;font-weight:800;color:#2E0066;margin:0 0 2px 0;line-height:1.1;/g, 'font-size:22px;font-weight:800;color:#2E0066;margin:0 0 2px 0;line-height:1.1;');
// 4. Subtitle Badge (AIQ - MBBS / SQ - MBBS)
sectionHtml = sectionHtml.replace(/font-size:10px;font-weight:800;color:#fff;background:#4B1E88;display:inline-block;padding:2px 8px;border-radius:4px;margin-bottom:4px;width:fit-content;/g, 'font-size:12px;font-weight:800;color:#fff;background:#4B1E88;display:inline-block;padding:3px 10px;border-radius:4px;margin-bottom:6px;width:fit-content;');
// 5. Screen Description text
sectionHtml = sectionHtml.replace(/font-size:7px;font-weight:800;color:#2E0066;margin-bottom:4px;/g, 'font-size:9.5px;font-weight:800;color:#2E0066;margin-bottom:6px;');
// 6. Feature list container
sectionHtml = sectionHtml.replace(/text-align:left;font-size:6.5px;font-weight:700;color:#111;margin-top:auto;/g, 'text-align:left;font-size:8.5px;font-weight:700;color:#111;margin-top:auto;');
// 7. Feature icons
sectionHtml = sectionHtml.replace(/style="color:#2E0066;font-size:6px;"/g, 'style="color:#2E0066;font-size:7.5px;"');
// 8. Feature margin
sectionHtml = sectionHtml.replace(/margin-bottom:1.5px;display:flex;align-items:center;gap:3px;/g, 'margin-bottom:2.5px;display:flex;align-items:center;gap:4px;');

// Reconstruct the full HTML
const finalHtml = html.substring(0, sectionStartIdx) + sectionHtml + html.substring(sectionEndIdx);
fs.writeFileSync(filePath, finalHtml, 'utf8');
console.log('Successfully increased text sizes in medical options tablet screens');
