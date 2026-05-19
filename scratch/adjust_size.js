const fs = require('fs');
const path = require('path');
const indexPath = 'c:\\Users\\rushi\\Downloads\\DCneetcounselling\\frontend\\web\\index.html';

try {
  let content = fs.readFileSync(indexPath, 'utf8');

  // We'll replace only inside the predictor block
  const startIdx = content.indexOf('id="section-predictor"');
  if (startIdx !== -1) {
    const endIdx = content.indexOf('</main>', startIdx);
    let predictorBlock = content.substring(startIdx, endIdx);

    // Adjust sizes down
    predictorBlock = predictorBlock.replace(/max-width: 950px;/g, 'max-width: 650px;');
    predictorBlock = predictorBlock.replace(/font-size: 72px;/g, 'font-size: 42px;');
    predictorBlock = predictorBlock.replace(/font-size: 110px;/g, 'font-size: 64px;');
    predictorBlock = predictorBlock.replace(/font-size: 34px;/g, 'font-size: 22px;');
    predictorBlock = predictorBlock.replace(/font-size: 40px;/g, 'font-size: 28px;');
    predictorBlock = predictorBlock.replace(/padding: 42px;/g, 'padding: 30px;');
    predictorBlock = predictorBlock.replace(/height: 78px;/g, 'height: 54px;');
    predictorBlock = predictorBlock.replace(/font-size: 30px;/g, 'font-size: 18px;');
    predictorBlock = predictorBlock.replace(/padding: 0 40px;/g, 'padding: 0 24px;');
    predictorBlock = predictorBlock.replace(/font-size: 180px;/g, 'font-size: 86px;');
    predictorBlock = predictorBlock.replace(/padding: 48px;/g, 'padding: 30px;');
    predictorBlock = predictorBlock.replace(/font-size: 26px;/g, 'font-size: 18px;');
    predictorBlock = predictorBlock.replace(/font-size: 22px;/g, 'font-size: 16px;');
    predictorBlock = predictorBlock.replace(/padding: 14px 34px;/g, 'padding: 10px 24px;');
    predictorBlock = predictorBlock.replace(/width: 600px;/g, 'width: 400px;');
    predictorBlock = predictorBlock.replace(/height: 600px;/g, 'height: 400px;');
    predictorBlock = predictorBlock.replace(/margin-bottom: 40px;/g, 'margin-bottom: 24px;');
    predictorBlock = predictorBlock.replace(/margin: 40px 0;/g, 'margin: 24px 0;');
    
    // Rewrite back
    content = content.substring(0, startIdx) + predictorBlock + content.substring(endIdx);
    fs.writeFileSync(indexPath, content, 'utf8');
    console.log('Successfully adjusted predictor section sizes.');
  } else {
    console.log('Predictor section not found.');
  }
} catch (error) {
  console.error('Error modifying file:', error);
}
