const fs = require('fs');
const path = require('path');
const indexPath = 'c:\\Users\\rushi\\Downloads\\DCneetcounselling\\frontend\\web\\index.html';

try {
  let content = fs.readFileSync(indexPath, 'utf8');

  const startIdx = content.indexOf('<style>', content.indexOf('id="section-predictor"'));
  const endIdx = content.indexOf('</style>', startIdx) + 8;
  
  if (startIdx !== -1 && endIdx !== -1) {
    const newStyle = `<style>
        #section-predictor {
          background: radial-gradient(circle at center, #2B0052 0%, #1A0035 35%, #120021 70%, #0A0014 100%);
          color: #FFFFFF;
          font-family: 'Poppins', sans-serif;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          padding: 40px 24px;
        }

        .predictor-particles {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: 1;
          pointer-events: none;
          background-image: radial-gradient(rgba(176,38,255,0.22) 1px, transparent 1px);
          background-size: 30px 30px;
        }
        
        .predictor-glow-circle {
          position: absolute;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(176,38,255,0.65) 0%, rgba(176,38,255,0.25) 45%, rgba(176,38,255,0) 100%);
          opacity: 0.28;
          border-radius: 50%;
          top: -300px;
          right: -300px;
          z-index: 1;
          filter: blur(180px);
        }

        .predictor-content {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .predictor-hero {
          text-align: center;
          margin-bottom: 24px;
        }

        .predictor-title {
          font-weight: 800;
          font-size: 42px;
          letter-spacing: -2px;
          line-height: 1.1;
          margin: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .predictor-title .line1 {
          color: #FFD233;
          text-shadow: 0 0 18px rgba(255,210,51,0.55);
        }

        .predictor-title .line2 {
          background: linear-gradient(90deg, #FFD233 0%, #FFC83D 18%, #F3A7FF 45%, #D45BFF 72%, #B026FF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .predictor-subtitle {
          font-size: 20px;
          color: rgba(255,255,255,0.72);
          max-width: 720px;
          margin: 20px auto 0;
        }

        .predictor-card {
          background: linear-gradient(180deg, rgba(42,0,82,0.96) 0%, rgba(24,0,45,0.96) 100%);
          border-radius: 32px;
          border: 1px solid rgba(255,255,255,0.08);
          padding: 30px;
          width: 100%;
          max-width: 650px;
          box-shadow: 0 0 80px rgba(176,38,255,0.22);
          text-align: center;
          box-sizing: border-box;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          position: relative;
        }
        
        .predictor-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 32px;
          padding: 2px;
          background: linear-gradient(135deg, rgba(255,210,51,0.55), rgba(176,38,255,0.55));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .predictor-card-title {
          color: #FFFFFF;
          font-size: 22px;
          font-weight: 700;
          margin: 0 0 20px;
        }

        .predictor-score-display {
          font-size: 64px;
          font-weight: 800;
          color: #FFFFFF;
          line-height: 1;
          margin-bottom: 30px;
          display: flex;
          justify-content: center;
          align-items: baseline;
        }

        .predictor-score-max {
          font-size: 28px;
          color: rgba(255,255,255,0.45);
          margin-left: 5px;
        }

        .predictor-slider-container {
          margin: 24px 0;
          position: relative;
        }

        .predictor-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 10px;
          background: rgba(255,255,255,0.12);
          border-radius: 5px;
          outline: none;
        }

        .predictor-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #FFFFFF;
          border: 4px solid #FFD233;
          box-shadow: 0 0 18px rgba(255,210,51,0.55);
          cursor: pointer;
          transition: transform 0.2s;
        }

        .predictor-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }

        .predictor-slider::-moz-range-thumb {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #FFFFFF;
          border: 4px solid #FFD233;
          box-shadow: 0 0 18px rgba(255,210,51,0.55);
          cursor: pointer;
        }

        .predictor-btn {
          height: 54px;
          border-radius: 24px;
          background: linear-gradient(90deg, #FFD233 0%, #FFC83D 20%, #E47CFF 58%, #B026FF 100%);
          color: #1A0035;
          font-size: 18px;
          font-weight: 800;
          border: none;
          padding: 0 24px;
          cursor: pointer;
          box-shadow: 0 0 35px rgba(255,210,51,0.35);
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin-top: 20px;
        }

        .predictor-btn:hover {
          background: linear-gradient(90deg, #FFE066 0%, #FFD233 20%, #F29CFF 58%, #C145FF 100%);
          transform: scale(1.03);
          box-shadow: 0 0 45px rgba(255,210,51,0.45);
        }

        /* Result Section */
        .predictor-result-section {
          margin-top: 42px;
          display: none;
          width: 100%;
          max-width: 650px;
        }

        .predictor-result-card {
          background: linear-gradient(180deg, rgba(42,0,82,0.96) 0%, rgba(24,0,45,0.96) 100%);
          border-radius: 34px;
          padding: 30px;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 0 80px rgba(176,38,255,0.22);
          text-align: center;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          position: relative;
        }
        
        .predictor-result-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 34px;
          padding: 2px;
          background: linear-gradient(135deg, rgba(255,210,51,0.55), rgba(176,38,255,0.55));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .predictor-result-badge {
          background: #220042;
          border: 1px solid rgba(255,210,51,0.55);
          color: #FFD233;
          font-weight: 700;
          font-size: 16px;
          padding: 10px 24px;
          border-radius: 20px;
          display: inline-block;
          margin-bottom: 20px;
          box-shadow: 0 0 18px rgba(255,210,51,0.2);
        }

        .predictor-rank-display {
          background: linear-gradient(180deg, #FFF3A0 0%, #FFD233 30%, #FFCC1A 60%, #F0A000 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-size: 86px;
          font-weight: 900;
          letter-spacing: -3px;
          line-height: 1.1;
          margin: 20px 0;
          filter: drop-shadow(0 0 45px rgba(255,210,51,0.42));
        }

        .predictor-result-label {
          color: rgba(255,255,255,0.72);
          font-size: 18px;
          font-weight: 500;
          letter-spacing: 2px;
        }

        /* Responsive */
        @media(max-width: 768px) {
          #section-predictor { padding: 40px 18px; }
          .predictor-title { font-size: 36px; }
          .predictor-subtitle { font-size: 15px; }
          .predictor-card, .predictor-result-card { padding: 24px; }
          .predictor-score-display { font-size: 54px; }
          .predictor-score-max { font-size: 24px; }
          .predictor-btn { height: 50px; font-size: 16px; }
          .predictor-rank-display { font-size: 64px; }
          .predictor-result-label { font-size: 16px; }
          .predictor-result-badge { font-size: 14px; padding: 8px 18px; }
        }
      </style>`;

    content = content.substring(0, startIdx) + newStyle + content.substring(endIdx);
    fs.writeFileSync(indexPath, content, 'utf8');
    console.log('Successfully updated predictor section theme.');
  } else {
    console.log('Predictor section style not found.');
  }
} catch (error) {
  console.error('Error modifying file:', error);
}
