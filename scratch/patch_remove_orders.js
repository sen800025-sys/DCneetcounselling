const fs = require('fs');
const path = 'c:\\Users\\rushi\\Downloads\\DCneetcounselling\\frontend\\web\\js\\app_v2.js';
let content = fs.readFileSync(path, 'utf8');

// Orders Patch for window.navigate
const ordersRegex = /renderOrders\(\)\.then\(html => \{\r?\n\s*if \(html\) ordersEl\.innerHTML = html;\r?\n\s*\}\)\.catch\(err => \{\r?\n\s*ordersEl\.innerHTML = '<div style="padding:120px 20px;text-align:center;color:#ef4444;">Failed to load orders\. Please refresh\.<\/div>';\r?\n\s*\}\);/;
const newOrders = `renderOrders().then(html => {
                if (html) ordersEl.innerHTML = html;
            }).catch(err => {
                console.error("Orders load error caught safely:", err);
            });`;

if (ordersRegex.test(content)) {
    content = content.replace(ordersRegex, newOrders);
    console.log("Patched orders catch block");
}

fs.writeFileSync(path, content, 'utf8');
