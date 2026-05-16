const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/web/index.html');
let html = fs.readFileSync(filePath, 'utf8');

const config = {
  "studentReviewSection": {
    "enabled": true,
    "position": "below-ebook-cards",
    "container": {
      "maxWidth": "1500px",
      "marginTop": "70px",
      "padding": "35px",
      "borderRadius": "30px",
      "background": "linear-gradient(180deg, #2A0050 0%, #18002F 100%)",
      "border": "2px solid #FFC400",
      "boxShadow": "0 0 35px rgba(255,196,0,0.18)"
    },
    "header": {
      "badge": {
        "text": "👥 STUDENT REVIEWS",
        "background": "rgba(255,196,0,0.12)",
        "border": "1px solid #FFC400",
        "color": "#FFFFFF",
        "padding": "10px 22px",
        "borderRadius": "999px",
        "fontSize": "16px",
        "fontWeight": "700"
      },
      "title": {
        "text": "Trusted by Thousands of NEET Aspirants",
        "fontSizeDesktop": "64px",
        "fontSizeMobile": "34px",
        "fontWeight": "900",
        "color": "#FFFFFF",
        "highlightWord": "Thousands",
        "highlightColor": "#FFC400",
        "marginTop": "20px"
      },
      "subtitle": {
        "text": "Real Reviews from Real Students",
        "fontSize": "22px",
        "fontWeight": "500",
        "color": "#E5D8FF",
        "marginTop": "12px"
      }
    },
    "statsBar": {
      "enabled": true,
      "marginTop": "40px",
      "background": "rgba(20,0,40,0.55)",
      "border": "1.5px solid #FFC400",
      "borderRadius": "24px",
      "padding": "28px",
      "items": [
        { "icon": "⭐", "value": "4.8/5", "label": "Average Rating" },
        { "icon": "👨‍🎓", "value": "25,000+", "label": "Happy Students" },
        { "icon": "💬", "value": "18,500+", "label": "Reviews" },
        { "icon": "⭐⭐⭐⭐⭐", "value": "", "label": "Rated Excellent" }
      ]
    },
    "reviewCards": {
      "layout": {
        "desktopColumns": 4,
        "tabletColumns": 2,
        "mobileColumns": 1,
        "gap": "24px",
        "marginTop": "35px"
      },
      "cardStyle": {
        "background": "linear-gradient(180deg, #240042 0%, #17002B 100%)",
        "border": "1.5px solid #FFC400",
        "borderRadius": "24px",
        "padding": "26px",
        "hoverGlow": "0 0 25px rgba(255,196,0,0.22)"
      },
      "items": [
        {
          "name": "Rohan Sharma",
          "course": "MBBS Student",
          "college": "AIIMS Delhi",
          "rating": "5.0",
          "review": "The cutoff data and college wise analysis helped me choose the best college. Highly recommended!"
        },
        {
          "name": "Ananya Patel",
          "course": "BDS Student",
          "college": "Manipal College of Dental Sciences",
          "rating": "5.0",
          "review": "Very detailed and updated eBook. The fee structure and seat matrix details were extremely helpful!"
        },
        {
          "name": "Rahul Verma",
          "course": "BAMS Student",
          "college": "IMS BHU",
          "rating": "5.0",
          "review": "Category wise cutoff and preference list made counselling very easy for me."
        },
        {
          "name": "Sneha Nair",
          "course": "BVSc Student",
          "college": "GADVASU, Ludhiana",
          "rating": "5.0",
          "review": "Clear, precise and extremely useful. Bond details and fees structure information is excellent."
        }
      ]
    },
    "bottomTrustBar": {
      "enabled": true,
      "marginTop": "35px",
      "background": "rgba(20,0,40,0.55)",
      "border": "1.5px solid #FFC400",
      "borderRadius": "24px",
      "padding": "24px",
      "items": [
        { "icon": "🛡️", "title": "100% Authentic", "subtitle": "Verified Reviews" },
        { "icon": "👥", "title": "Trusted by Thousands", "subtitle": "" },
        { "icon": "🏆", "title": "Proven Results", "subtitle": "Better College Selection" },
        { "icon": "⬇️", "title": "Instant Help", "subtitle": "For Your NEET Journey" }
      ]
    },
    "mobileOptimization": {
      "padding": "20px",
      "titleSize": "36px",
      "cardPadding": "20px",
      "statsDirection": "column"
    }
  }
};

const c = config.studentReviewSection;

const css = `
    <style>
      .sr-section {
        max-width: ${c.container.maxWidth};
        margin: ${c.container.marginTop} auto 40px auto;
        padding: ${c.container.padding};
        background: ${c.container.background};
        border: ${c.container.border};
        border-radius: ${c.container.borderRadius};
        box-shadow: ${c.container.boxShadow};
        text-align: center;
        box-sizing: border-box;
      }

      .sr-badge {
        display: inline-block;
        background: ${c.header.badge.background};
        border: ${c.header.badge.border};
        color: ${c.header.badge.color};
        padding: ${c.header.badge.padding};
        border-radius: ${c.header.badge.borderRadius};
        font-size: ${c.header.badge.fontSize};
        font-weight: ${c.header.badge.fontWeight};
        margin-bottom: 20px;
      }

      .sr-title {
        font-size: ${c.header.title.fontSizeDesktop};
        font-weight: ${c.header.title.fontWeight};
        color: ${c.header.title.color};
        margin: ${c.header.title.marginTop} 0 0 0;
        line-height: 1.1;
      }

      .sr-title span {
        color: ${c.header.title.highlightColor};
      }

      .sr-subtitle {
        font-size: ${c.header.subtitle.fontSize};
        font-weight: ${c.header.subtitle.fontWeight};
        color: ${c.header.subtitle.color};
        margin-top: ${c.header.subtitle.marginTop};
      }

      .sr-stats-bar {
        margin-top: ${c.statsBar.marginTop};
        background: ${c.statsBar.background};
        border: ${c.statsBar.border};
        border-radius: ${c.statsBar.borderRadius};
        padding: ${c.statsBar.padding};
        display: flex;
        justify-content: space-around;
        align-items: center;
        gap: 20px;
        flex-wrap: wrap;
      }

      .sr-stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }

      .sr-stat-icon { font-size: 24px; }
      .sr-stat-value { font-size: 24px; font-weight: 800; color: #FFC400; }
      .sr-stat-label { font-size: 14px; color: rgba(255,255,255,0.7); font-weight: 500; }

      .sr-grid {
        display: grid;
        grid-template-columns: repeat(${c.reviewCards.layout.desktopColumns}, 1fr);
        gap: ${c.reviewCards.layout.gap};
        margin-top: ${c.reviewCards.layout.marginTop};
      }

      .sr-card {
        background: ${c.reviewCards.cardStyle.background};
        border: ${c.reviewCards.cardStyle.border};
        border-radius: ${c.reviewCards.cardStyle.borderRadius};
        padding: ${c.reviewCards.cardStyle.padding};
        text-align: left;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .sr-card:hover {
        transform: translateY(-8px);
        box-shadow: ${c.reviewCards.cardStyle.hoverGlow};
      }

      .sr-user-info { display: flex; align-items: center; gap: 12px; }
      .sr-avatar { width: 44px; height: 44px; border-radius: 50%; background: #4B1E88; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff; border: 1px solid #FFC400; }
      .sr-name { font-size: 16px; font-weight: 700; color: #fff; }
      .sr-course { font-size: 12px; color: #FFC400; font-weight: 600; }
      .sr-college { font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 2px; }
      .sr-rating { color: #FFC400; font-size: 14px; }
      .sr-review-text { font-size: 13.5px; color: rgba(255,255,255,0.8); line-height: 1.6; font-style: italic; }

      .sr-trust-bar {
        margin-top: ${c.bottomTrustBar.marginTop};
        background: ${c.bottomTrustBar.background};
        border: ${c.bottomTrustBar.border};
        border-radius: ${c.bottomTrustBar.borderRadius};
        padding: ${c.bottomTrustBar.padding};
        display: flex;
        justify-content: space-around;
        align-items: center;
        gap: 20px;
        flex-wrap: wrap;
      }

      .sr-trust-item {
        display: flex;
        align-items: center;
        gap: 12px;
        text-align: left;
      }

      .sr-trust-icon { font-size: 24px; }
      .sr-trust-title { font-size: 14px; font-weight: 700; color: #fff; }
      .sr-trust-subtitle { font-size: 11px; color: rgba(255,255,255,0.5); }

      @media (max-width: 1200px) {
        .sr-grid { grid-template-columns: repeat(${c.reviewCards.layout.tabletColumns}, 1fr); }
      }

      @media (max-width: 767px) {
        .sr-section { margin: 40px 15px; padding: ${c.mobileOptimization.padding}; border-radius: 20px; }
        .sr-title { font-size: ${c.header.title.fontSizeMobile}; }
        .sr-subtitle { font-size: 16px; }
        .sr-stats-bar { flex-direction: ${c.mobileOptimization.statsDirection}; padding: 20px; }
        .sr-grid { grid-template-columns: repeat(${c.reviewCards.layout.mobileColumns}, 1fr); }
        .sr-card { padding: ${c.mobileOptimization.cardPadding}; }
        .sr-trust-bar { flex-direction: column; align-items: flex-start; padding: 20px; gap: 15px; }
      }
    </style>
`;

const titleText = c.header.title.text.replace(c.header.title.highlightWord, `<span>${c.header.title.highlightWord}</span>`);

const statsHtml = c.statsBar.items.map(item => `
        <div class="sr-stat-item">
          <div class="sr-stat-icon">${item.icon}</div>
          ${item.value ? `<div class="sr-stat-value">${item.value}</div>` : ''}
          <div class="sr-stat-label">${item.label}</div>
        </div>
`).join('');

const reviewsHtml = c.reviewCards.items.map(review => `
        <div class="sr-card">
          <div class="sr-user-info">
            <div class="sr-avatar">${review.name.charAt(0)}</div>
            <div>
              <div class="sr-name">${review.name}</div>
              <div class="sr-course">${review.course}</div>
              <div class="sr-college">${review.college}</div>
            </div>
          </div>
          <div class="sr-rating">
            ${'★'.repeat(Math.floor(parseFloat(review.rating)))}${parseFloat(review.rating) % 1 !== 0 ? '½' : ''}
          </div>
          <div class="sr-review-text">"${review.review}"</div>
        </div>
`).join('');

const trustHtml = c.bottomTrustBar.items.map(item => `
        <div class="sr-trust-item">
          <div class="sr-trust-icon">${item.icon}</div>
          <div>
            <div class="sr-trust-title">${item.title}</div>
            ${item.subtitle ? `<div class="sr-trust-subtitle">${item.subtitle}</div>` : ''}
          </div>
        </div>
`).join('');

const fullHtml = `
      <!-- Student Review Section -->
      ${css}
      <div class="sr-section">
        <div class="sr-badge">${c.header.badge.text}</div>
        <h2 class="sr-title">${titleText}</h2>
        <p class="sr-subtitle">${c.header.subtitle.text}</p>

        <div class="sr-stats-bar">
          ${statsHtml}
        </div>

        <div class="sr-grid">
          ${reviewsHtml}
        </div>

        <div class="sr-trust-bar">
          ${trustHtml}
        </div>
      </div>
`;

// Insert after the ebook grid end
const gridEnd = html.indexOf('</div>\n    </div>\n<!-- Medical Options Screen -->');
if (gridEnd !== -1) {
    const insertPos = gridEnd + 11; // After the two closing divs
    html = html.substring(0, insertPos) + fullHtml + html.substring(insertPos);
}

fs.writeFileSync(filePath, html, 'utf8');
console.log('Successfully added Student Review Section');
