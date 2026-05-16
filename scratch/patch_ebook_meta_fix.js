const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/web/index.html');
let html = fs.readFileSync(filePath, 'utf8');

const newMeta = `var EBOOK_META = {
      'medical': { title: 'Medical', icon: 'fa-stethoscope', color: '#2563eb', price: 99, courses: 'MBBS', course: 'Medical', quota: 'All India Quota' },
      'medical_aiq': { title: 'Medical (AIQ)', icon: 'fa-globe', color: '#2563eb', price: 199, courses: 'MBBS', course: 'Medical', quota: 'All India Quota' },
      'medical_state': { title: 'Medical (State Quota)', icon: 'fa-map-marker-alt', color: '#16a34a', price: 99, courses: 'MBBS', course: 'Medical', quota: 'State Quota' },
      'dental': { title: 'Dental', icon: 'fa-tooth', color: '#06b6d4', price: 149, courses: 'BDS', course: 'Dental', quota: 'All Courses' },
      'ayush': { title: 'AYUSH', icon: 'fa-leaf', color: '#16a34a', price: 199, courses: 'BAMS, BHMS, BSMS, BUMS', course: 'AYUSH', quota: 'All Courses' },
      'veterinary': { title: 'Veterinary', icon: 'fa-paw', color: '#f59e0b', price: 149, courses: 'BVSc', course: 'Veterinary', quota: 'All Courses' }
    };`;

const metaStart = html.indexOf('var EBOOK_META = {');
const metaEnd = html.indexOf('};', metaStart) + 2;

if (metaStart !== -1 && metaEnd !== -1) {
    html = html.substring(0, metaStart) + newMeta + html.substring(metaEnd);
}

fs.writeFileSync(filePath, html, 'utf8');
console.log('Successfully updated EBOOK_META');
