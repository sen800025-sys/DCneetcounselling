const fs = require('fs');
const path = require('path');
const indexPath = 'c:\\Users\\rushi\\Downloads\\DCneetcounselling\\frontend\\web\\index.html';
const predictorPath = 'c:\\Users\\rushi\\Downloads\\DCneetcounselling\\scratch\\predictor_section.html';

try {
  let content = fs.readFileSync(indexPath, 'utf8');
  const predictorContent = fs.readFileSync(predictorPath, 'utf8');
  
  if (!content.includes('id="section-predictor"')) {
    content = content.replace(/<\/main>/, predictorContent + '\n  </main>');
    fs.writeFileSync(indexPath, content, 'utf8');
    console.log('Successfully injected predictor section.');
  } else {
    console.log('Predictor section already exists.');
  }
} catch (error) {
  console.error('Error modifying file:', error);
}
