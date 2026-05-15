const fs = require('fs');
const path = 'c:\\Users\\rushi\\Downloads\\DCneetcounselling\\frontend\\web\\js\\app_v2.js';
let content = fs.readFileSync(path, 'utf8');

// Wallet Patch
const walletRegex = /renderWallet\(\)\.then\(html => \{\r?\n\s*if \(html\) walletEl\.innerHTML = html;\r?\n\s*\}\)\.catch\(err => \{\r?\n\s*walletEl\.innerHTML = '<div style="padding:120px 20px;text-align:center;color:#ef4444;">Failed to load wallet\. Please refresh\.<\/div>';\r?\n\s*\}\);/;
const newWallet = `renderWallet().then(html => {
                if (html) walletEl.innerHTML = html;
            }).catch(err => {
                console.error("Wallet load error caught safely:", err);
            });`;

if (walletRegex.test(content)) {
    content = content.replace(walletRegex, newWallet);
    console.log("Patched wallet catch block");
}

// Dashboard Patch
const dashRegex = /renderDashboard\(\)\.then\(html => \{\r?\n\s*if \(html\) dashEl\.innerHTML = html;\r?\n\s*\}\)\.catch\(err => \{\r?\n\s*dashEl\.innerHTML = '<div style="padding:120px 20px;text-align:center;color:#ef4444;">Failed to load dashboard\. Please refresh\.<\/div>';\r?\n\s*\}\);/;
const newDash = `renderDashboard().then(html => {
                if (html) dashEl.innerHTML = html;
            }).catch(err => {
                console.error("Dashboard load error caught safely:", err);
            });`;

if (dashRegex.test(content)) {
    content = content.replace(dashRegex, newDash);
    console.log("Patched dashboard catch block");
}

fs.writeFileSync(path, content, 'utf8');
