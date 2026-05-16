const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/web/index.html');
let html = fs.readFileSync(filePath, 'utf8');

const startTag = '<div id="section-ebooks" class="page-section"';
const endTag = '<!-- Medical Options Screen -->';

const startIndex = html.indexOf(startTag);
const endIndex = html.indexOf(endTag);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find start or end tags!");
  process.exit(1);
}

const newEbooksSection = `<!-- eBooks Section -->
    <div id="section-ebooks" class="page-section" style="
          background: #120024;
          padding: 30px 20px;
          font-family: 'Poppins', var(--font-main);
          min-height: 100vh;
          display: none;
        ">
      <style>
        .ebook-grid-premium {
          display: grid;
          gap: 22px;
          grid-template-columns: repeat(1, 1fr);
          max-width: 1500px;
          margin: 0 auto;
        }

        @media (min-width: 768px) {
          .ebook-grid-premium {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .ebook-grid-premium {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .ebook-card-premium {
          background: linear-gradient(180deg, #1A0036 0%, #130026 100%);
          border-radius: 22px;
          padding: 18px;
          border: 1.5px solid rgba(171, 88, 255, 0.7);
          transition: 0.3s ease;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .ebook-card-premium:hover {
          transform: translateY(-8px);
          box-shadow: 0 0 35px rgba(163, 74, 255, 0.55);
        }

        .ep-badge {
          position: absolute;
          top: -1px;
          left: -1px;
          background: #FFC400;
          color: #000000;
          font-size: 18px;
          font-weight: 800;
          padding: 10px 14px;
          border-radius: 22px 0 14px 0;
          z-index: 10;
        }

        .ep-heart {
          position: absolute;
          top: 15px;
          right: 15px;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
          color: #FFFFFF !important;
          transition: all 0.2s;
          z-index: 10;
        }

        .ep-heart:hover {
          background: rgba(255,255,255,0.2);
          color: #ef4444 !important;
        }
        
        .ep-heart.active {
          color: #ef4444 !important;
          background: rgba(255,255,255,0.2);
        }

        .ep-tablet-preview {
          width: 100%;
          height: 300px;
          border-radius: 26px;
          background: #000000;
          padding: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 35px rgba(0,0,0,0.5);
          margin-bottom: 20px;
          position: relative;
          box-sizing: border-box;
          border: 2px solid #333;
        }

        .ep-tablet-screen {
          width: 100%;
          height: 100%;
          border-radius: 18px;
          background: #ffffff;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .ep-screen-top {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 15px 10px 5px 10px;
        }

        .ep-screen-logo {
          width: 40px;
          height: auto;
        }

        .ep-screen-top-text {
          font-size: 10px;
          font-weight: 800;
          color: #000;
          line-height: 1.1;
        }

        .ep-screen-content {
          padding: 5px 15px 15px 15px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .ep-screen-title {
          font-size: 32px;
          font-weight: 800;
          color: #2E0066;
          margin: 0 0 4px 0;
          line-height: 1.1;
        }

        .ep-screen-subtitle {
          font-size: 16px;
          font-weight: 800;
          color: #ffffff;
          background: #4B1E88;
          display: inline-block;
          padding: 4px 12px;
          border-radius: 6px;
          margin-bottom: 12px;
          width: fit-content;
        }
        
        .ep-screen-desc {
          font-size: 11px;
          font-weight: 800;
          color: #2E0066;
          margin-bottom: 12px;
        }

        .ep-features {
          text-align: left;
          font-size: 9px;
          font-weight: 700;
          color: #111;
          margin-top: auto;
          position: relative;
          z-index: 2;
        }
        
        .ep-features div {
          margin-bottom: 5px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ep-features i {
          color: #2E0066;
          font-size: 12px;
        }

        .ep-edition {
          position: absolute;
          top: 15px;
          right: 15px;
          background: #FFC400;
          color: #000;
          font-size: 12px;
          font-weight: 800;
          padding: 6px 8px;
          border-radius: 4px;
        }

        .ep-bottom-icon {
          position: absolute;
          bottom: 10px;
          right: 10px;
          font-size: 80px;
          opacity: 0.15;
          z-index: 1;
        }

        .ep-card-info {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 15px;
          padding: 0 5px;
        }

        .ep-info-left {
          text-align: left;
        }

        .ep-info-category {
          font-size: 16px;
          font-weight: 600;
          color: #E8D8FF;
          margin-bottom: 8px;
        }

        .ep-price-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ep-old-price {
          font-size: 24px;
          font-weight: 600;
          color: #8E84A9;
          text-decoration: line-through;
        }

        .ep-new-price {
          font-size: 38px;
          font-weight: 800;
          color: #FFC400;
          line-height: 1;
        }

        .ep-save-box {
          background: #123F2B;
          color: #21D07A;
          border-radius: 10px;
          padding: 8px 12px;
          font-size: 14px;
          font-weight: 700;
          height: fit-content;
          margin-bottom: 5px;
        }

        .ep-btn-primary {
          background: #FFC400;
          color: #000000;
          height: 58px;
          border-radius: 14px;
          font-weight: 800;
          font-size: 22px;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 12px;
          width: 100%;
        }

        .ep-btn-primary:hover {
          background: #FFD84D;
        }

        .ep-btn-secondary {
          background: transparent;
          border: 1.5px solid #8B2CFF;
          color: #E8D8FF;
          height: 54px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 18px;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 15px;
          width: 100%;
        }

        .ep-btn-secondary:hover {
          background: rgba(139, 44, 255, 0.1);
        }

        .ep-footer-text {
          color: #FFC400;
          font-size: 16px;
          font-weight: 600;
          text-align: center;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
        }

        @media (max-width: 768px) {
          .ep-tablet-preview {
            height: 250px;
          }
          .ep-btn-primary {
            height: 50px;
            font-size: 18px;
          }
          .ep-btn-secondary {
            height: 48px;
            font-size: 16px;
          }
          .ep-new-price {
            font-size: 32px;
          }
          .ep-screen-title {
            font-size: 26px;
          }
          .ebook-card-premium {
            padding: 16px;
          }
        }
      </style>

      <div class="ebook-grid-premium">

        <!-- Medical -->
        <div class="ebook-card-premium" onclick="window.navigate('medical-options')">
          <div class="ep-badge">50%<br>OFF</div>
          <button class="ep-heart" data-ebook="medical" onclick="event.stopPropagation(); toggleWishlist(this, 'medical')"><i class="far fa-heart"></i></button>
          
          <div class="ep-tablet-preview">
            <div class="ep-tablet-screen">
              <div class="ep-edition">2025<br>EDITION</div>
              <div class="ep-screen-top">
                <img src="assets/logo.webp" class="ep-screen-logo" alt="Logo">
                <div class="ep-screen-top-text">NEET<br>COUNSELLING</div>
              </div>
              <div class="ep-screen-content">
                <div class="ep-screen-title" style="color: #2E0066;">MEDICAL</div>
                <div class="ep-screen-subtitle" style="background: #4B1E88;">MBBS</div>
                <div class="ep-screen-desc">COUNSELLING GUIDE eBook</div>
                
                <div class="ep-features">
                  <div><i class="fas fa-check-circle"></i> Counselling Rules & Guide</div>
                  <div><i class="fas fa-check-circle"></i> Previous Year Cutoffs</div>
                  <div><i class="fas fa-check-circle"></i> Participating Institute List</div>
                  <div><i class="fas fa-check-circle"></i> FAQs & Important Info</div>
                </div>
                <i class="fas fa-user-md ep-bottom-icon" style="color: #2E0066;"></i>
              </div>
            </div>
          </div>

          <div class="ep-card-info">
            <div class="ep-info-left">
              <div class="ep-info-category">MBBS</div>
              <div class="ep-price-wrap">
                <span class="ep-old-price">&#8377;198</span>
                <span class="ep-new-price">&#8377;99</span>
              </div>
            </div>
            <div class="ep-save-box">You Save &#8377;99</div>
          </div>

          <button class="ep-btn-primary" onclick="event.stopPropagation(); window.navigate('medical-options')">
            <i class="fas fa-shopping-cart"></i> Buy Now at &#8377;99
          </button>
          <button class="ep-btn-secondary" data-ebook="medical" onclick="event.stopPropagation(); addToCart(this, 'medical')">
            <i class="fas fa-cart-plus"></i> Add to Cart
          </button>
          <div class="ep-footer-text"><i class="fas fa-hourglass-half"></i> Limited Time Offer</div>
        </div>

        <!-- Dental -->
        <div class="ebook-card-premium" onclick="console.log('open_category: dental')">
          <div class="ep-badge">50%<br>OFF</div>
          <button class="ep-heart" data-ebook="dental" onclick="event.stopPropagation(); toggleWishlist(this, 'dental')"><i class="far fa-heart"></i></button>
          
          <div class="ep-tablet-preview">
            <div class="ep-tablet-screen">
              <div class="ep-edition">2025<br>EDITION</div>
              <div class="ep-screen-top">
                <img src="assets/logo.webp" class="ep-screen-logo" alt="Logo">
                <div class="ep-screen-top-text">NEET<br>COUNSELLING</div>
              </div>
              <div class="ep-screen-content">
                <div class="ep-screen-title" style="color: #2E0066;">DENTAL</div>
                <div class="ep-screen-subtitle" style="background: #4B1E88;">BDS</div>
                <div class="ep-screen-desc">COUNSELLING GUIDE eBook</div>
                
                <div class="ep-features">
                  <div><i class="fas fa-check-circle"></i> Counselling Rules & Guide</div>
                  <div><i class="fas fa-check-circle"></i> Previous Year Cutoffs</div>
                  <div><i class="fas fa-check-circle"></i> Participating Institute List</div>
                  <div><i class="fas fa-check-circle"></i> FAQs & Important Info</div>
                </div>
                <i class="fas fa-tooth ep-bottom-icon" style="color: #2E0066;"></i>
              </div>
            </div>
          </div>

          <div class="ep-card-info">
            <div class="ep-info-left">
              <div class="ep-info-category">BDS</div>
              <div class="ep-price-wrap">
                <span class="ep-old-price">&#8377;298</span>
                <span class="ep-new-price">&#8377;149</span>
              </div>
            </div>
            <div class="ep-save-box">You Save &#8377;149</div>
          </div>

          <button class="ep-btn-primary" onclick="event.stopPropagation(); openEbookPurchaseModal('Dental', 'All Courses', 149, 'Dental Cutoff eBooks')">
            <i class="fas fa-shopping-cart"></i> Buy Now at &#8377;149
          </button>
          <button class="ep-btn-secondary" data-ebook="dental" onclick="event.stopPropagation(); addToCart(this, 'dental')">
            <i class="fas fa-cart-plus"></i> Add to Cart
          </button>
          <div class="ep-footer-text"><i class="fas fa-hourglass-half"></i> Limited Time Offer</div>
        </div>

        <!-- AYUSH -->
        <div class="ebook-card-premium" onclick="console.log('open_category: ayush')">
          <div class="ep-badge">50%<br>OFF</div>
          <button class="ep-heart" data-ebook="ayush" onclick="event.stopPropagation(); toggleWishlist(this, 'ayush')"><i class="far fa-heart"></i></button>
          
          <div class="ep-tablet-preview">
            <div class="ep-tablet-screen">
              <div class="ep-edition">2025<br>EDITION</div>
              <div class="ep-screen-top">
                <img src="assets/logo.webp" class="ep-screen-logo" alt="Logo">
                <div class="ep-screen-top-text">NEET<br>COUNSELLING</div>
              </div>
              <div class="ep-screen-content">
                <div class="ep-screen-title" style="color: #2E0066;">AYUSH</div>
                <div class="ep-screen-subtitle" style="background: #4B1E88;">BAMS, BHMS, BSMS, BUMS</div>
                <div class="ep-screen-desc">COUNSELLING GUIDE eBook</div>
                
                <div class="ep-features">
                  <div><i class="fas fa-check-circle"></i> Counselling Rules & Guide</div>
                  <div><i class="fas fa-check-circle"></i> Previous Year Cutoffs</div>
                  <div><i class="fas fa-check-circle"></i> Participating Institute List</div>
                  <div><i class="fas fa-check-circle"></i> FAQs & Important Info</div>
                </div>
                <i class="fas fa-leaf ep-bottom-icon" style="color: #16a34a; opacity: 0.2;"></i>
              </div>
            </div>
          </div>

          <div class="ep-card-info">
            <div class="ep-info-left">
              <div class="ep-info-category">BAMS, BHMS, BSMS, BUMS</div>
              <div class="ep-price-wrap">
                <span class="ep-old-price">&#8377;398</span>
                <span class="ep-new-price">&#8377;199</span>
              </div>
            </div>
            <div class="ep-save-box">You Save &#8377;199</div>
          </div>

          <button class="ep-btn-primary" onclick="event.stopPropagation(); openEbookPurchaseModal('AYUSH', 'All Courses', 199, 'AYUSH Cutoff eBooks')">
            <i class="fas fa-shopping-cart"></i> Buy Now at &#8377;199
          </button>
          <button class="ep-btn-secondary" data-ebook="ayush" onclick="event.stopPropagation(); addToCart(this, 'ayush')">
            <i class="fas fa-cart-plus"></i> Add to Cart
          </button>
          <div class="ep-footer-text"><i class="fas fa-hourglass-half"></i> Limited Time Offer</div>
        </div>

        <!-- Veterinary -->
        <div class="ebook-card-premium" onclick="console.log('open_category: veterinary')">
          <div class="ep-badge">50%<br>OFF</div>
          <button class="ep-heart" data-ebook="veterinary" onclick="event.stopPropagation(); toggleWishlist(this, 'veterinary')"><i class="far fa-heart"></i></button>
          
          <div class="ep-tablet-preview">
            <div class="ep-tablet-screen">
              <div class="ep-edition">2025<br>EDITION</div>
              <div class="ep-screen-top">
                <img src="assets/logo.webp" class="ep-screen-logo" alt="Logo">
                <div class="ep-screen-top-text">NEET<br>COUNSELLING</div>
              </div>
              <div class="ep-screen-content">
                <div class="ep-screen-title" style="color: #2E0066;">VETERINARY</div>
                <div class="ep-screen-subtitle" style="background: #4B1E88;">BVSc</div>
                <div class="ep-screen-desc">COUNSELLING GUIDE eBook</div>
                
                <div class="ep-features">
                  <div><i class="fas fa-check-circle"></i> Counselling Rules & Guide</div>
                  <div><i class="fas fa-check-circle"></i> Previous Year Cutoffs</div>
                  <div><i class="fas fa-check-circle"></i> Participating Institute List</div>
                  <div><i class="fas fa-check-circle"></i> FAQs & Important Info</div>
                </div>
                <i class="fas fa-paw ep-bottom-icon" style="color: #d97706; opacity: 0.2;"></i>
              </div>
            </div>
          </div>

          <div class="ep-card-info">
            <div class="ep-info-left">
              <div class="ep-info-category">BVSc</div>
              <div class="ep-price-wrap">
                <span class="ep-old-price">&#8377;298</span>
                <span class="ep-new-price">&#8377;149</span>
              </div>
            </div>
            <div class="ep-save-box">You Save &#8377;149</div>
          </div>

          <button class="ep-btn-primary" onclick="event.stopPropagation(); openEbookPurchaseModal('Veterinary', 'All Courses', 149, 'Veterinary Cutoff eBooks')">
            <i class="fas fa-shopping-cart"></i> Buy Now at &#8377;149
          </button>
          <button class="ep-btn-secondary" data-ebook="veterinary" onclick="event.stopPropagation(); addToCart(this, 'veterinary')">
            <i class="fas fa-cart-plus"></i> Add to Cart
          </button>
          <div class="ep-footer-text"><i class="fas fa-hourglass-half"></i> Limited Time Offer</div>
        </div>

      </div>
    </div>
`;

let newHtml = html.substring(0, startIndex) + newEbooksSection + html.substring(endIndex);

fs.writeFileSync(filePath, newHtml, 'utf8');
console.log('Ebooks section updated successfully!');
