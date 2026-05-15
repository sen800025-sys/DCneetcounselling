const fs = require('fs');
const path = 'c:\\Users\\rushi\\Downloads\\DCneetcounselling\\frontend\\web\\js\\app_v2.js';

let content = fs.readFileSync(path, 'utf8');

// 1. Patch renderDashboard()
const dashboardStart = `async function renderDashboard() {
    var user = window._authUser || {};
    var meta = user.user_metadata || {};`;

const newDashboardStart = `async function renderDashboard() {
    console.log("FETCHING DASHBOARD");
    var user = window._authUser;
    
    // Mobile Session Hydration & Retry Logic
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
    console.log("USER:", user);
    
    var meta = user.user_metadata || {};`;

content = content.replace(dashboardStart, newDashboardStart);


// 2. Patch renderWallet()
const walletStart = `async function renderWallet() {
    console.log('[App] Rendering Wallet...');
    var user = window._authUser;
    if (!user && window.supabaseClient) {
        var { data } = await window.supabaseClient.auth.getSession();
        if (data && data.session) user = data.session.user;
    }

    if (!user || !user.id) {`;

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

content = content.replace(walletStart, newWalletStart);


// 3. Patch renderOrders()
const ordersStart = `async function renderOrders() {
    console.log('[App] Rendering Orders...');
    var user = window._authUser;
    if (!user && window.supabaseClient) {
        var { data } = await window.supabaseClient.auth.getSession();
        if (data && data.session) user = data.session.user;
    }

    if (!user || !user.id) {`;

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

content = content.replace(ordersStart, newOrdersStart);


fs.writeFileSync(path, content, 'utf8');
console.log('Successfully patched auth session retry logic for mobile!');
