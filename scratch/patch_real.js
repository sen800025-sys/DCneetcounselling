const fs = require('fs');
const path = 'c:\\Users\\rushi\\Downloads\\DCneetcounselling\\frontend\\web\\js\\app_v2.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Dashboard Patch
const dashboardRegex = /async function renderDashboard\(\) \{\r?\n\s*var user = window\._authUser \|\| \{\};\r?\n\s*var meta = user\.user_metadata \|\| \{\};/;

const newDashboardStart = `async function renderDashboard() {
    console.log("FETCHING DASHBOARD");
    var user = window._authUser;
    
    if (!user && window.supabaseClient) {
        console.log("SESSION NOT READY, FETCHING...");
        var { data } = await window.supabaseClient.auth.getSession();
        if (data && data.session) user = data.session.user;
    }
    
    if (!user || !user.id) {
        console.log("SESSION STILL NULL, RETRYING...");
        await new Promise(r => setTimeout(r, 1200));
        if (window.supabaseClient) {
            var { data } = await window.supabaseClient.auth.getSession();
            if (data && data.session) user = data.session.user;
        }
    }
    
    if (!user || !user.id) {
        return '<div style="padding:160px 20px; text-align:center;">' +
            '<h3>Access Restricted</h3>' +
            '<p style="color:#666; margin:10px 0 20px;">Please log in to view your dashboard.</p>' +
            '<button class="btn btn-primary" onclick="window.navigate(\\'login\\')">Sign In</button>' +
        '</div>';
    }
    
    window._authUser = user;
    var meta = user.user_metadata || {};`;

if (dashboardRegex.test(content)) {
    content = content.replace(dashboardRegex, newDashboardStart);
    console.log("Patched renderDashboard");
} else {
    console.log("Failed to patch renderDashboard");
}

// 2. Wallet Patch
const walletRegex = /async function renderWallet\(\) \{\r?\n\s*console\.log\('\[App\] Rendering Wallet\.\.\.'\);\r?\n\s*var user = window\._authUser;\r?\n\s*if \(\!user && window\.supabaseClient\) \{\r?\n\s*var \{ data \} = await window\.supabaseClient\.auth\.getSession\(\);\r?\n\s*if \(data && data\.session\) user = data\.session\.user;\r?\n\s*\}\r?\n\r?\n\s*if \(\!user \|\| \!user\.id\) \{/;

const newWalletStart = `async function renderWallet() {
    console.log('FETCHING WALLET');
    var user = window._authUser;
    if (!user && window.supabaseClient) {
        var { data } = await window.supabaseClient.auth.getSession();
        if (data && data.session) user = data.session.user;
    }
    
    if (!user || !user.id) {
        await new Promise(r => setTimeout(r, 1200));
        if (window.supabaseClient) {
            var { data } = await window.supabaseClient.auth.getSession();
            if (data && data.session) user = data.session.user;
        }
    }

    if (!user || !user.id) {`;

if (walletRegex.test(content)) {
    content = content.replace(walletRegex, newWalletStart);
    console.log("Patched renderWallet");
} else {
    console.log("Failed to patch renderWallet");
}

// 3. Orders Patch
const ordersRegex = /async function renderOrders\(\) \{\r?\n\s*console\.log\('\[App\] Rendering Orders\.\.\.'\);\r?\n\s*var user = window\._authUser;\r?\n\s*if \(\!user && window\.supabaseClient\) \{\r?\n\s*var \{ data \} = await window\.supabaseClient\.auth\.getSession\(\);\r?\n\s*if \(data && data\.session\) user = data\.session\.user;\r?\n\s*\}\r?\n\r?\n\s*if \(\!user \|\| \!user\.id\) \{/;

const newOrdersStart = `async function renderOrders() {
    console.log('FETCHING ORDERS');
    var user = window._authUser;
    if (!user && window.supabaseClient) {
        var { data } = await window.supabaseClient.auth.getSession();
        if (data && data.session) user = data.session.user;
    }
    
    if (!user || !user.id) {
        await new Promise(r => setTimeout(r, 1200));
        if (window.supabaseClient) {
            var { data } = await window.supabaseClient.auth.getSession();
            if (data && data.session) user = data.session.user;
        }
    }

    if (!user || !user.id) {`;

if (ordersRegex.test(content)) {
    content = content.replace(ordersRegex, newOrdersStart);
    console.log("Patched renderOrders");
} else {
    console.log("Failed to patch renderOrders");
}

fs.writeFileSync(path, content, 'utf8');
