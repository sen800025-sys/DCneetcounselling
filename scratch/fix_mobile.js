const fs = require('fs');
const indexPath = 'c:\\Users\\rushi\\Downloads\\DCneetcounselling\\frontend\\web\\index.html';

try {
  let content = fs.readFileSync(indexPath, 'utf8');

  // Find the predictor style block
  const sectionStart = content.indexOf('id="section-predictor"');
  const styleStart = content.indexOf('<style>', sectionStart);
  const styleEnd = content.indexOf('</style>', styleStart) + 8;

  if (styleStart === -1 || styleEnd === -1) {
    console.log('Style block not found.');
    process.exit(1);
  }

  let styleBlock = content.substring(styleStart, styleEnd);

  // Replace the existing mobile media query with a much better one
  const mobileStart = styleBlock.indexOf('/* Responsive */');
  const mobileEnd = styleBlock.indexOf('</style>');

  if (mobileStart !== -1) {
    const beforeMobile = styleBlock.substring(0, mobileStart);
    const newMobile = `/* Responsive */
        @media(max-width: 768px) {
          #section-predictor {
            padding: 30px 16px;
            min-height: auto;
          }
          .predictor-hero {
            margin-bottom: 20px;
          }
          .predictor-title {
            font-size: 32px;
            letter-spacing: -1px;
          }
          .predictor-subtitle {
            font-size: 14px;
            margin-top: 12px;
          }
          .predictor-card {
            padding: 20px 16px;
            border-radius: 24px;
            max-width: 100%;
          }
          .predictor-card-title {
            font-size: 18px;
            margin-bottom: 12px;
          }
          .predictor-score-display {
            font-size: 52px;
            margin-bottom: 16px;
          }
          .predictor-score-max {
            font-size: 20px;
          }
          .predictor-slider-container {
            margin: 16px 0;
          }
          .predictor-btn {
            height: 48px;
            font-size: 15px;
            padding: 0 20px;
            border-radius: 16px;
            gap: 10px;
            width: 100%;
            margin-top: 12px;
          }
          .predictor-result-section {
            margin-top: 24px;
            max-width: 100%;
          }
          .predictor-result-card {
            padding: 24px 16px;
            border-radius: 24px;
          }
          .predictor-result-badge {
            font-size: 13px;
            padding: 8px 16px;
            border-radius: 14px;
            margin-bottom: 12px;
          }
          .predictor-rank-display {
            font-size: 42px;
            letter-spacing: -2px;
            margin: 12px 0;
            word-break: break-word;
          }
          .predictor-result-label {
            font-size: 13px;
            letter-spacing: 1px;
          }
          .predictor-glow-circle {
            width: 300px;
            height: 300px;
            top: -100px;
            right: -100px;
          }
        }
      </style>`;

    content = content.substring(0, styleStart) + beforeMobile + newMobile + content.substring(styleEnd);
  }

  // Fix the script tag leak - find the closing script in predictor and ensure it's proper
  // Look for the </script> inside predictor section that might have issues
  const predictorStart = content.indexOf('id="section-predictor"');
  const predictorEnd = content.indexOf('</div>\n  </main>', predictorStart);
  
  if (predictorEnd !== -1) {
    // Check for any malformed script closing tags
    let predictorBlock = content.substring(predictorStart, predictorEnd + 16);
    
    // The issue is likely escaped </script> - check for <\/script>
    if (predictorBlock.includes('<\\/script>')) {
      predictorBlock = predictorBlock.replace('<\\/script>', '</script>');
      content = content.substring(0, predictorStart) + predictorBlock + content.substring(predictorEnd + 16);
      console.log('Fixed escaped script tag.');
    }
  }

  fs.writeFileSync(indexPath, content, 'utf8');
  console.log('Successfully fixed mobile layout.');
} catch (error) {
  console.error('Error:', error);
}
