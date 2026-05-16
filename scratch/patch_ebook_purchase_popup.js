const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/web/index.html');
let html = fs.readFileSync(filePath, 'utf8');

const marker = '</body>';
if (!html.includes(marker)) {
    console.error('Could not find </body> marker');
    process.exit(1);
}

// Ensure we don't insert multiple times
if (html.includes('id="ebook-purchase-popup"')) {
    console.log('Popup already injected. Removing old one...');
    const startMarker = '<!-- Ebook Purchase Popup System -->';
    const endMarker = '<!-- End Ebook Purchase Popup System -->';
    const startIdx = html.indexOf(startMarker);
    const endIdx = html.indexOf(endMarker);
    if (startIdx !== -1 && endIdx !== -1) {
        html = html.substring(0, startIdx) + html.substring(endIdx + endMarker.length);
    }
}

const popupCode = `
<!-- Ebook Purchase Popup System -->
<style>
  #ebook-purchase-popup {
    position: fixed;
    bottom: 24px;
    left: 24px;
    z-index: 9999;
    pointer-events: none;
    width: 340px;
    background: rgba(32, 0, 58, 0.92);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1.5px solid #FFC400;
    border-radius: 20px;
    padding: 14px 16px;
    box-shadow: 0 0 25px rgba(255,196,0,0.12), 0 0 40px rgba(123,44,255,0.18);
    display: none;
    gap: 14px;
    align-items: center;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.45s ease, transform 0.45s ease;
    font-family: 'Poppins', var(--font-main);
    overflow: hidden;
  }

  #ebook-purchase-popup.show {
    display: flex;
  }

  #ebook-purchase-popup.animate-in {
    opacity: 1;
    transform: translateY(0);
  }

  .epp-avatar-wrapper {
    position: relative;
    flex-shrink: 0;
  }

  .epp-avatar {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7B2CFF 0%, #FFC400 100%);
    color: #FFFFFF;
    font-weight: 800;
    font-size: 18px;
    border: 2px solid rgba(255,255,255,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
  }

  .epp-live-dot {
    position: absolute;
    top: -2px;
    right: -2px;
    width: 10px;
    height: 10px;
    background-color: #22C55E;
    border-radius: 50%;
    border: 2px solid rgba(32, 0, 58, 1);
  }

  .epp-live-dot::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 10px;
    height: 10px;
    background-color: #22C55E;
    border-radius: 50%;
    animation: eppPulse 2s infinite;
  }

  @keyframes eppPulse {
    0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
    70% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
    100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
  }

  .epp-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .epp-title {
    color: #FFFFFF;
    font-size: 14px;
    font-weight: 700;
    margin: 0 0 2px 0;
    line-height: 1.3;
  }

  .epp-title span {
    font-weight: 400;
    color: #E5D8FF;
  }

  .epp-subtitle {
    color: #D7C8F5;
    font-size: 12px;
    margin: 0;
    line-height: 1.3;
  }

  .epp-subtitle strong {
    color: #FFC400;
    font-weight: 600;
  }

  .epp-time {
    color: #B8A8D9;
    font-size: 11px;
    margin-top: 3px;
  }

  .epp-progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background: rgba(255,255,255,0.08);
    width: 100%;
  }

  .epp-progress-fill {
    height: 100%;
    background: #FFC400;
    width: 0%;
  }

  @media (max-width: 767px) {
    #ebook-purchase-popup {
      left: 50%;
      bottom: 18px;
      transform: translate(-50%, 20px);
      width: 92vw;
      padding: 12px;
    }
    #ebook-purchase-popup.animate-in {
      transform: translate(-50%, 0);
    }
    .epp-title { font-size: 13px; }
    .epp-subtitle { font-size: 11px; }
    .epp-avatar { width: 40px; height: 40px; font-size: 16px; }
  }
</style>

<div id="ebook-purchase-popup">
  <div class="epp-avatar-wrapper">
    <div class="epp-avatar" id="epp-avatar-text">R</div>
    <div class="epp-live-dot"></div>
  </div>
  <div class="epp-content">
    <p class="epp-title" id="epp-name-loc">Rohan Sharma <span>from Rajasthan</span></p>
    <p class="epp-subtitle">Bought <strong>MBBS Counselling Guide</strong></p>
    <div class="epp-time" id="epp-time-text">5 minutes ago</div>
  </div>
  <div class="epp-progress-bar">
    <div class="epp-progress-fill" id="epp-progress-fill"></div>
  </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
  const popup = document.getElementById('ebook-purchase-popup');
  if (!popup) return;

  const avatarText = document.getElementById('epp-avatar-text');
  const nameLocText = document.getElementById('epp-name-loc');
  const subtitleText = popup.querySelector('.epp-subtitle');
  const timeText = document.getElementById('epp-time-text');
  const progressFill = document.getElementById('epp-progress-fill');

  const purchaseData = [
    { name: "Rohan Sharma", location: "Rajasthan", ebook: "MBBS Counselling Guide" },
    { name: "Priya Patel", location: "Gujarat", ebook: "AYUSH Counselling Guide" },
    { name: "Aman Verma", location: "Uttar Pradesh", ebook: "Dental Counselling Guide" },
    { name: "Sneha Nair", location: "Kerala", ebook: "MBBS Counselling Guide" },
    { name: "Rahul Singh", location: "Delhi", ebook: "Veterinary Counselling Guide" },
    { name: "Ananya Das", location: "West Bengal", ebook: "Dental Counselling Guide" },
    { name: "Karan Mehta", location: "Maharashtra", ebook: "MBBS Counselling Guide" },
    { name: "Harsh Raj", location: "Bihar", ebook: "AYUSH Counselling Guide" },
    { name: "Vivek Yadav", location: "Madhya Pradesh", ebook: "MBBS Counselling Guide" },
    { name: "Pooja Kumari", location: "Jharkhand", ebook: "Dental Counselling Guide" },
    { name: "Arjun Reddy", location: "Telangana", ebook: "MBBS Counselling Guide" },
    { name: "Nikhil Jain", location: "Punjab", ebook: "Veterinary Counselling Guide" },
    { name: "Meera Joshi", location: "Haryana", ebook: "AYUSH Counselling Guide" },
    { name: "Akash Gupta", location: "Chhattisgarh", ebook: "MBBS Counselling Guide" },
    { name: "Ishita Roy", location: "Assam", ebook: "Dental Counselling Guide" },
    { name: "Dev Malhotra", location: "Chandigarh", ebook: "MBBS Counselling Guide" },
    { name: "Neha Kapoor", location: "Himachal Pradesh", ebook: "AYUSH Counselling Guide" },
    { name: "Sarthak Mishra", location: "Odisha", ebook: "MBBS Counselling Guide" },
    { name: "Ritika Jain", location: "Tamil Nadu", ebook: "Dental Counselling Guide" },
    { name: "Abhishek Tiwari", location: "Karnataka", ebook: "MBBS Counselling Guide" }
  ];

  const timeFormats = [
    "Just now", "1 minute ago", "2 minutes ago", "5 minutes ago", "8 minutes ago", "12 minutes ago"
  ];

  let isPopupActive = false;
  let currentTimeout = null;
  let progressInterval = null;
  let isHovered = false;

  popup.addEventListener('mouseenter', () => isHovered = true);
  popup.addEventListener('mouseleave', () => isHovered = false);

  function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shouldShowPopup() {
    // Hide if checkout modal or cart is open
    const isCheckoutOpen = document.getElementById('payment-modal') && document.getElementById('payment-modal').style.display === 'flex';
    const isCartOpen = document.getElementById('cart-modal') && document.getElementById('cart-modal').style.display === 'flex';
    
    const ebookSection = document.getElementById('section-ebooks');
    const medicalSection = document.getElementById('section-medical-options');
    
    let isIntersecting = false;
    
    if (ebookSection && ebookSection.style.display !== 'none') {
        const rect = ebookSection.getBoundingClientRect();
        if (rect.top <= window.innerHeight && rect.bottom >= 0) isIntersecting = true;
    }
    
    if (medicalSection && medicalSection.style.display !== 'none') {
        const rect = medicalSection.getBoundingClientRect();
        if (rect.top <= window.innerHeight && rect.bottom >= 0) isIntersecting = true;
    }

    return isIntersecting && !isCheckoutOpen && !isCartOpen;
  }

  function showPopup() {
    if (!shouldShowPopup()) {
      scheduleNextPopup();
      return;
    }

    if (isPopupActive) return;
    isPopupActive = true;

    const data = getRandomItem(purchaseData);
    const time = getRandomItem(timeFormats);

    avatarText.textContent = data.name.charAt(0);
    nameLocText.innerHTML = \`\${data.name} <span>from \${data.location}</span>\`;
    subtitleText.innerHTML = \`Bought <strong>\${data.ebook}</strong>\`;
    timeText.textContent = time;

    popup.style.display = 'flex';
    // Trigger reflow
    void popup.offsetWidth;
    popup.classList.add('animate-in');

    let startTime = Date.now();
    const duration = 5000;

    progressFill.style.width = '0%';
    progressFill.style.transition = 'none';

    clearInterval(progressInterval);
    progressInterval = setInterval(() => {
      if (isHovered) {
        startTime += 50; // Pause timer
        return;
      }
      const elapsed = Date.now() - startTime;
      const percent = Math.min((elapsed / duration) * 100, 100);
      progressFill.style.width = percent + '%';

      if (percent >= 100) {
        hidePopup();
      }
    }, 50);
  }

  function hidePopup() {
    clearInterval(progressInterval);
    popup.classList.remove('animate-in');
    
    setTimeout(() => {
      popup.style.display = 'none';
      isPopupActive = false;
      scheduleNextPopup();
    }, 450); // wait for exit animation
  }

  function scheduleNextPopup(isFirst = false) {
    clearTimeout(currentTimeout);
    
    let delay = 0;
    if (isFirst) {
      delay = 6000; // 6 seconds first delay
    } else {
      const min = 4000;
      const max = 16000;
      delay = Math.floor(Math.random() * (max - min + 1)) + min;
      
      if (window.innerWidth < 768) {
        delay += 10000; // Reduce frequency on mobile
      }
    }

    currentTimeout = setTimeout(() => {
      showPopup();
    }, delay);
  }

  // Use IntersectionObserver to trigger immediately when scrolling into ebook section
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !isPopupActive) {
        // If we scroll into section, try to show sooner instead of waiting full delay
        clearTimeout(currentTimeout);
        currentTimeout = setTimeout(() => {
           if (shouldShowPopup() && !isPopupActive) {
              showPopup();
           }
        }, 3000); 
      } else if (!entry.isIntersecting && isPopupActive && !shouldShowPopup()) {
        // Hide immediately if scrolled out of all valid sections
        hidePopup();
      }
    });
  }, { threshold: 0.2 });
  
  const ebookSection = document.getElementById('section-ebooks');
  if (ebookSection) observer.observe(ebookSection);
  
  const medicalSection = document.getElementById('section-medical-options');
  if (medicalSection) observer.observe(medicalSection);

  scheduleNextPopup(true);
});
</script>
<!-- End Ebook Purchase Popup System -->
`;

const updatedHtml = html.replace('</body>', popupCode + '\n</body>');

fs.writeFileSync(filePath, updatedHtml, 'utf8');
console.log('Ebook Purchase Popup successfully injected.');
