const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/web/index.html');
let html = fs.readFileSync(filePath, 'utf8');

const marker = '<!-- Medical Options Screen -->';
const markerPos = html.indexOf(marker);

if (markerPos === -1) {
    console.error('Could not find marker');
    process.exit(1);
}

// Check if we already inserted it
const existingMarker = '<!-- Student Review Section -->';
const existingMarkerPos = html.indexOf(existingMarker);
if (existingMarkerPos !== -1 && existingMarkerPos < markerPos) {
    // If it exists, let's remove it
    html = html.substring(0, existingMarkerPos) + html.substring(markerPos);
}

const config = {
  "studentReviewSection": {
    "enabled": true,
    "position": "below-ebook-cards",

    "container": {
      "maxWidth": "1500px",
      "marginTop": "70px",
      "padding": "0px",
      "background": "transparent",
      "border": "none",
      "boxShadow": "none"
    },

    "websiteThemeIntegration": {
      "important": true,
      "sectionBackground": "transparent",
      "useSameWebsiteBackground": true,
      "primaryBackground": "#120024",
      "secondaryBackground": "#1A0033",
      "textColor": "#FFFFFF",
      "subTextColor": "#E5D8FF",
      "goldBorder": "#FFC400",
      "purpleGlow": "rgba(123,44,255,0.22)"
    },

    "header": {
      "alignment": "center",

      "badge": {
        "enabled": true,
        "text": "👥 STUDENT REVIEWS",
        "background": "rgba(255,196,0,0.08)",
        "border": "1px solid #FFC400",
        "color": "#FFFFFF",
        "padding": "10px 24px",
        "borderRadius": "999px",
        "fontSize": "16px",
        "fontWeight": "700",
        "backdropFilter": "blur(10px)"
      },

      "title": {
        "text": "Trusted by Thousands of NEET Aspirants",
        "fontSizeDesktop": "64px",
        "fontSizeTablet": "48px",
        "fontSizeMobile": "34px",
        "fontWeight": "900",
        "lineHeight": "1.1",
        "color": "#FFFFFF",
        "marginTop": "22px",

        "highlightWord": "Thousands",
        "highlightColor": "#FFC400"
      },

      "subtitle": {
        "text": "Real Reviews from Real Students",
        "fontSizeDesktop": "22px",
        "fontSizeMobile": "16px",
        "fontWeight": "500",
        "color": "#E5D8FF",
        "marginTop": "14px"
      }
    },

    "statsBar": {
      "enabled": true,
      "marginTop": "42px",

      "style": {
        "background": "linear-gradient(180deg, rgba(42,0,80,0.88) 0%, rgba(24,0,47,0.92) 100%)",
        "border": "1.5px solid #FFC400",
        "borderRadius": "24px",
        "padding": "28px",
        "boxShadow": "0 0 30px rgba(255,196,0,0.12)"
      },

      "layout": {
        "desktopColumns": 4,
        "mobileColumns": 2,
        "gap": "20px"
      },

      "items": [
        {
          "icon": "⭐",
          "value": "4.8/5",
          "label": "Average Rating"
        },
        {
          "icon": "👨‍🎓",
          "value": "25,000+",
          "label": "Happy Students"
        },
        {
          "icon": "💬",
          "value": "18,500+",
          "label": "Reviews"
        },
        {
          "icon": "⭐⭐⭐⭐⭐",
          "value": "",
          "label": "Rated Excellent"
        }
      ],

      "itemStyle": {
        "textAlign": "center",
        "iconSize": "58px",
        "valueFontSize": "48px",
        "valueWeight": "800",
        "valueColor": "#FFC400",
        "labelFontSize": "20px",
        "labelColor": "#FFFFFF"
      }
    },

    "reviewCards": {
      "marginTop": "34px",

      "layout": {
        "desktopColumns": 4,
        "tabletColumns": 2,
        "mobileColumns": 1,
        "gap": "24px"
      },

      "cardStyle": {
        "background": "linear-gradient(180deg, rgba(42,0,80,0.88) 0%, rgba(24,0,47,0.92) 100%)",
        "border": "1.5px solid #FFC400",
        "borderRadius": "24px",
        "padding": "26px",
        "boxShadow": "0 0 22px rgba(255,196,0,0.10)",
        "transition": "0.3s ease",
        "hover": {
          "translateY": "-6px",
          "boxShadow": "0 0 35px rgba(255,196,0,0.22)"
        }
      },

      "profileImage": {
        "size": "82px",
        "border": "3px solid #FFC400"
      },

      "quoteIcon": {
        "enabled": true,
        "color": "#FFC400",
        "size": "42px",
        "opacity": "0.9"
      },

      "rating": {
        "starColor": "#FFC400",
        "badgeBackground": "#5C22B5",
        "badgeText": "#FFFFFF"
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
      ],

      "textStyle": {
        "nameColor": "#FFFFFF",
        "nameSize": "30px",
        "nameWeight": "800",

        "courseColor": "#FFC400",
        "courseSize": "18px",
        "courseWeight": "600",

        "collegeColor": "#E5D8FF",
        "collegeSize": "16px",

        "reviewColor": "#FFFFFF",
        "reviewSize": "18px",
        "reviewLineHeight": "1.7"
      }
    },

    "bottomTrustBar": {
      "enabled": true,
      "marginTop": "34px",

      "style": {
        "background": "linear-gradient(180deg, rgba(42,0,80,0.88) 0%, rgba(24,0,47,0.92) 100%)",
        "border": "1.5px solid #FFC400",
        "borderRadius": "24px",
        "padding": "24px",
        "boxShadow": "0 0 22px rgba(255,196,0,0.10)"
      },

      "layout": {
        "desktopColumns": 4,
        "mobileColumns": 2,
        "gap": "20px"
      },

      "items": [
        {
          "icon": "🛡️",
          "title": "100% Authentic",
          "subtitle": "Verified Reviews"
        },
        {
          "icon": "👥",
          "title": "Trusted by Thousands",
          "subtitle": ""
        },
        {
          "icon": "🏆",
          "title": "Proven Results",
          "subtitle": "Better College Selection"
        },
        {
          "icon": "⬇️",
          "title": "Instant Help",
          "subtitle": "For Your NEET Journey"
        }
      ],

      "itemStyle": {
        "textAlign": "center",
        "iconSize": "52px",
        "titleColor": "#FFFFFF",
        "titleSize": "24px",
        "titleWeight": "700",
        "subtitleColor": "#E5D8FF",
        "subtitleSize": "16px"
      }
    },

    "mobileOptimization": {
      "sectionPadding": "20px",
      "titleSize": "36px",
      "subtitleSize": "15px",
      "cardPadding": "20px",
      "statsStack": true
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
        box-shadow: ${c.container.boxShadow};
        text-align: ${c.header.alignment};
        box-sizing: border-box;
        position: relative;
        z-index: 10;
        font-family: 'Poppins', var(--font-main);
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
        backdrop-filter: ${c.header.badge.backdropFilter};
      }

      .sr-title {
        font-size: 48px;
        font-weight: 900;
        color: ${c.header.title.color};
        margin: ${c.header.title.marginTop} 0 0 0;
        line-height: 1.2;
      }

      .sr-title span {
        color: ${c.header.title.highlightColor} !important;
      }

      .sr-subtitle {
        font-size: ${c.header.subtitle.fontSizeDesktop};
        font-weight: ${c.header.subtitle.fontWeight};
        color: ${c.header.subtitle.color};
        margin-top: ${c.header.subtitle.marginTop};
      }

      .sr-grid {
        display: grid;
        grid-template-columns: repeat(${c.reviewCards.layout.desktopColumns}, 1fr);
        gap: ${c.reviewCards.layout.gap};
        margin-top: ${c.reviewCards.layout.marginTop};
      }

      .sr-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 196, 0, 0.3);
        border-radius: 16px;
        padding: 18px;
        box-shadow: 0 0 22px rgba(255,196,0,0.05);
        text-align: left;
        transition: transform ${c.reviewCards.cardStyle.transition}, box-shadow ${c.reviewCards.cardStyle.transition};
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .sr-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 0 35px rgba(255,196,0,0.15);
      }

      .sr-user-info { display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }
      .sr-avatar { width: 40px; height: 40px; border-radius: 50%; background: ${c.reviewCards.rating.badgeBackground}; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; color: ${c.reviewCards.rating.badgeText}; border: 2px solid #FFC400; }
      .sr-name { font-size: 16px; font-weight: ${c.reviewCards.textStyle.nameWeight}; color: ${c.reviewCards.textStyle.nameColor}; }
      .sr-rating { color: ${c.reviewCards.rating.starColor}; font-size: 14px; margin-bottom: 6px;}
      .sr-review-text { font-size: 13px; color: ${c.reviewCards.textStyle.reviewColor}; line-height: 1.5; font-style: italic; }

      .sr-trust-bar {
        margin-top: 24px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 196, 0, 0.3);
        border-radius: 16px;
        padding: 18px;
        box-shadow: 0 0 22px rgba(255,196,0,0.05);
        display: grid;
        grid-template-columns: repeat(${c.bottomTrustBar.layout.desktopColumns}, 1fr);
        gap: 15px;
      }

      .sr-trust-item {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        text-align: left;
      }

      .sr-trust-icon { font-size: 28px; }
      .sr-trust-title { font-size: 15px; font-weight: ${c.bottomTrustBar.itemStyle.titleWeight}; color: ${c.bottomTrustBar.itemStyle.titleColor}; }
      .sr-trust-subtitle { font-size: 12px; color: ${c.bottomTrustBar.itemStyle.subtitleColor}; margin-top: 2px; }

      @media (max-width: 1200px) {
        .sr-grid { grid-template-columns: repeat(${c.reviewCards.layout.tabletColumns}, 1fr); }
        .sr-trust-bar { grid-template-columns: repeat(2, 1fr); }
      }

      @media (max-width: 767px) {
        .sr-section { padding: 12px; margin-top: 30px; }
        .sr-title { font-size: 24px !important; }
        .sr-subtitle { font-size: 13px !important; }
        .sr-grid { grid-template-columns: repeat(1, 1fr); gap: 12px; }
        .sr-card { padding: 12px; }
        .sr-trust-bar { grid-template-columns: repeat(1, 1fr); gap: 10px; padding: 12px; }
        .sr-trust-item { justify-content: flex-start; }
      }
    </style>
`;

const titleText = c.header.title.text.replace(c.header.title.highlightWord, `<span style="color: #FFC400;">${c.header.title.highlightWord}</span>`);

const reviewsHtml = c.reviewCards.items.map(review => `
        <div class="sr-card">
          <div class="sr-user-info">
            <div class="sr-avatar">${review.name.charAt(0)}</div>
            <div>
              <div class="sr-name">${review.name}</div>
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

        <div class="sr-grid">
          ${reviewsHtml}
        </div>

        <div class="sr-trust-bar">
          ${trustHtml}
        </div>
      </div>
`;

const targetStr = '    </div>\r\n<!-- Medical Options Screen -->';
let targetPos = html.indexOf(targetStr);
if (targetPos === -1) {
    targetPos = html.indexOf('    </div>\n<!-- Medical Options Screen -->');
}

if (targetPos === -1) {
    console.error('Could not find target position');
    process.exit(1);
}

const beforeMarker = html.substring(0, targetPos);
const afterMarker = html.substring(targetPos);

const updatedHtml = beforeMarker + '\n' + fullHtml + '\n' + afterMarker;

fs.writeFileSync(filePath, updatedHtml, 'utf8');
console.log('Successfully updated Student Review Section');
