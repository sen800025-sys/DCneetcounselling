const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/web/index.html');
let html = fs.readFileSync(filePath, 'utf8');

const startTag = '<!-- eBooks Section -->';
const endTag = '<!-- Medical Options Screen -->';

const startIndex = html.indexOf(startTag);
const endIndex = html.indexOf(endTag);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find start or end tags!");
  process.exit(1);
}

const newEbooksSection = `<!-- eBooks Section -->
    <div id="section-ebooks" class="page-section" style="
          background: #0B0014;
          padding: 40px 20px;
          font-family: 'Poppins', var(--font-main);
          min-height: 100vh;
          display: none;
        ">
      <style>
        .ebook-grid-premium {
          display: grid;
          gap: 24px;
          grid-template-columns: repeat(1, 1fr);
          max-width: 1300px;
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
          background: #0A0014;
          border-radius: 12px;
          padding: 16px;
          border: 1px solid #4B1E88;
          transition: 0.3s ease;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .ebook-card-premium:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(75, 30, 136, 0.4);
        }

        .ep-badge {
          position: absolute;
          top: -1px;
          left: -1px;
          background: #FFC400;
          color: #000000;
          font-size: 14px;
          font-weight: 800;
          padding: 8px 12px;
          border-radius: 12px 0 12px 0;
          z-index: 10;
          line-height: 1.2;
          text-align: center;
        }

        .ep-heart {
          position: absolute;
          top: 15px;
          right: 15px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
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
          height: 260px;
          border-radius: 20px;
          background: #000000;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          margin-bottom: 20px;
          position: relative;
          box-sizing: border-box;
          border: 1px solid #333;
        }

        .ep-tablet-screen {
          width: 100%;
          height: 100%;
          border-radius: 14px;
          background: #f8f9fa;
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
          font-size: 30px;
          font-weight: 800;
          color: #2E0066;
          margin: 0 0 4px 0;
          line-height: 1.1;
        }

        .ep-screen-subtitle {
          font-size: 14px;
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
          font-size: 10px;
          font-weight: 800;
          color: #2E0066;
          margin-bottom: 12px;
        }

        .ep-features {
          text-align: left;
          font-size: 8px;
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
          font-size: 10px;
        }

        .ep-edition {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #FFC400;
          color: #000;
          font-size: 10px;
          font-weight: 800;
          padding: 4px 6px;
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

        .ep-category-title {
          font-size: 13px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 8px;
          text-align: left;
        }

        .ep-price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .ep-prices {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .ep-old-price {
          font-size: 18px;
          font-weight: 500;
          color: #6b7280;
          text-decoration: line-through;
        }

        .ep-new-price {
          font-size: 32px;
          font-weight: 800;
          color: #FFC400;
          line-height: 1;
        }

        .ep-save-box {
          background: #064e3b;
          color: #22c55e;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 11px;
          font-weight: 600;
        }

        .ep-btn-primary {
          background: #FFC400;
          color: #000000;
          height: 48px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 16px;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 12px;
          width: 100%;
        }

        .ep-btn-primary:hover {
          background: #eab308;
        }

        .ep-btn-secondary {
          background: transparent;
          border: 1px solid #7c3aed;
          color: #c4b5fd;
          height: 48px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 16px;
          width: 100%;
        }

        .ep-btn-secondary:hover {
          background: rgba(124, 58, 237, 0.1);
        }

        .ep-footer-text {
          color: #FFC400;
          font-size: 12px;
          font-weight: 500;
          text-align: center;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
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

          <div class="ep-category-title">MBBS</div>
          
          <div class="ep-price-row">
            <div class="ep-prices">
              <span class="ep-old-price">&#8377;198</span>
              <span class="ep-new-price">&#8377;99</span>
            </div>
            <div class="ep-save-box">You Save &#8377;99</div>
          </div>

          <button class="ep-btn-primary" onclick="event.stopPropagation(); window.navigate('medical-options')">
            <i class="fas fa-shopping-cart"></i> Buy Now at &#8377;99
          </button>
          <button class="ep-btn-secondary" data-ebook="medical" onclick="event.stopPropagation(); addToCart(this, 'medical')">
            <i class="fas fa-shopping-cart"></i> Add to Cart
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

          <div class="ep-category-title">BDS</div>
          
          <div class="ep-price-row">
            <div class="ep-prices">
              <span class="ep-old-price">&#8377;298</span>
              <span class="ep-new-price">&#8377;149</span>
            </div>
            <div class="ep-save-box">You Save &#8377;149</div>
          </div>

          <button class="ep-btn-primary" onclick="event.stopPropagation(); openEbookPurchaseModal('Dental', 'All Courses', 149, 'Dental Cutoff eBooks')">
            <i class="fas fa-shopping-cart"></i> Buy Now at &#8377;149
          </button>
          <button class="ep-btn-secondary" data-ebook="dental" onclick="event.stopPropagation(); addToCart(this, 'dental')">
            <i class="fas fa-shopping-cart"></i> Add to Cart
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

          <div class="ep-category-title">BAMS, BHMS, BSMS, BUMS</div>
          
          <div class="ep-price-row">
            <div class="ep-prices">
              <span class="ep-old-price">&#8377;398</span>
              <span class="ep-new-price">&#8377;199</span>
            </div>
            <div class="ep-save-box">You Save &#8377;199</div>
          </div>

          <button class="ep-btn-primary" onclick="event.stopPropagation(); openEbookPurchaseModal('AYUSH', 'All Courses', 199, 'AYUSH Cutoff eBooks')">
            <i class="fas fa-shopping-cart"></i> Buy Now at &#8377;199
          </button>
          <button class="ep-btn-secondary" data-ebook="ayush" onclick="event.stopPropagation(); addToCart(this, 'ayush')">
            <i class="fas fa-shopping-cart"></i> Add to Cart
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

          <div class="ep-category-title">BVSc</div>
          
          <div class="ep-price-row">
            <div class="ep-prices">
              <span class="ep-old-price">&#8377;298</span>
              <span class="ep-new-price">&#8377;149</span>
            </div>
            <div class="ep-save-box">You Save &#8377;149</div>
          </div>

          <button class="ep-btn-primary" onclick="event.stopPropagation(); openEbookPurchaseModal('Veterinary', 'All Courses', 149, 'Veterinary Cutoff eBooks')">
            <i class="fas fa-shopping-cart"></i> Buy Now at &#8377;149
          </button>
          <button class="ep-btn-secondary" data-ebook="veterinary" onclick="event.stopPropagation(); addToCart(this, 'veterinary')">
            <i class="fas fa-shopping-cart"></i> Add to Cart
          </button>
          <div class="ep-footer-text"><i class="fas fa-hourglass-half"></i> Limited Time Offer</div>
        </div>

      </div>
    </div>
`;

let newHtml = html.substring(0, startIndex) + newEbooksSection + html.substring(endIndex);

fs.writeFileSync(filePath, newHtml, 'utf8');
console.log('Ebooks section updated successfully!');
