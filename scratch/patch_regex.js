const fs = require('fs');
const p = 'frontend/web/index.html';
let content = fs.readFileSync(p, 'utf8');

const target = [
'        // 4. Initiate Razorpay Checkout window',
'        var finalAmt = ctx.finalPrice !== undefined ? ctx.finalPrice : ctx.price;',
'        var options = {',
'          "key": "rzp_live_ShlgHvLVwqmST2", // Live Key Passed In',
'          "amount": Math.round(finalAmt * 100), // Razorpay amount in paise',
'          "currency": "INR",',
'          "name": "DC Neet Counselling",',
'          "description": ctx.title,',
'          "handler": async function (response) {'
].join('\n');

const replacement = [
'        // 4. Create Order on Backend & Initiate Razorpay Checkout window',
'        var finalAmt = ctx.finalPrice !== undefined ? ctx.finalPrice : ctx.price;',
'        ',
'        const backendUrl = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ',
'            ? "https://rlqmdylbzapyepuwncwt.supabase.co/functions/v1" ',
'            : "https://rlqmdylbzapyepuwncwt.supabase.co/functions/v1";',
'        const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscW1keWxiemFweWVwdXduY3d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNTcwNzYsImV4cCI6MjA5MTgzMzA3Nn0.oNNK1pwLnykQlNfUkw7IdB-ZBkKDoWxszsKDSIjsLeo";',
'        ',
'        const sessionData = window.supabaseClient ? await window.supabaseClient.auth.getSession() : null;',
'        const session = sessionData?.data?.session;',
'        const useWallet = document.getElementById("ebUseWalletToggle") ? document.getElementById("ebUseWalletToggle").checked : false;',
'',
'        const createRes = await fetch(`${backendUrl}/razorpay-payment`, {',
'            method: "POST",',
'            headers: { ',
'                "Content-Type": "application/json",',
'                "apikey": anonKey,',
'                "Authorization": session?.access_token ? `Bearer ${session.access_token}` : `Bearer ${anonKey}`',
'            },',
'            body: JSON.stringify({',
'                email: email,',
'                full_name: fullName,',
'                mobile: mobile,',
'                product_name: ctx.course + " (" + ctx.quota + ")",',
'                amount: ctx.price,',
'                coupon: ctx.appliedCoupon ? ctx.appliedCoupon.code : null,',
'                user_id: window._authUser ? window._authUser.id : null,',
'                wallet_enabled: useWallet,',
'                category: category,',
'                domicile_state: domicile,',
'                neet_score: neetScore,',
'                rank: rank,',
'                counselling_type: "ebook"',
'            })',
'        });',
'',
'        if (!createRes.ok) throw new Error(`Server Error: ${createRes.status}`);',
'        const order = await createRes.json();',
'        if (!order.success) throw new Error(order.error || "Failed to create order");',
'',
'        sessionStorage.setItem("pending_tracking", JSON.stringify({',
'          product: ctx.course + " (" + ctx.quota + ")",',
'          amount: ctx.price,',
'          order_id: order.order_id || ("EBK_" + Date.now()),',
'          coupon: ctx.appliedCoupon ? ctx.appliedCoupon.code : "",',
'          type: "ebook",',
'          email: email',
'        }));',
'',
'        if (order.is_wallet_only) {',
'            const responseVerify = await fetch(`${backendUrl}/verify-payment`, {',
'                method: "POST",',
'                headers: { "Content-Type": "application/json", "Authorization": session?.access_token ? `Bearer ${session.access_token}` : `Bearer ${anonKey}` },',
'                body: JSON.stringify({ order_id: order.order_id, is_wallet_only: true })',
'            });',
'            const dataVerify = await responseVerify.json();',
'            if (dataVerify.success) {',
'                window.location.href = `/thank-you/?product=${encodeURIComponent(ctx.course + " (" + ctx.quota + ")")}&amount=0&order_id=${order.order_id}&wallet_only=1`;',
'                return;',
'            } else {',
'                throw new Error("Wallet verification failed");',
'            }',
'        }',
'',
'        var options = {',
'          "key": order.key_id,',
'          "amount": Math.round(order.final_amount * 100),',
'          "currency": "INR",',
'          "name": "DC Neet Counselling",',
'          "description": ctx.title,',
'          "order_id": order.razorpay_order_id,',
'          "handler": async function (response) {'
].join('\n');

// Use replace on the whole file to handle possible \r\n issues
const regex = new RegExp('        // 4\\. Initiate Razorpay Checkout window[\\s\\S]*?"handler": async function \\(response\\) \\{', 'm');
if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(p, content);
    console.log('SUCCESS');
} else {
    console.log('FAILED TO FIND TARGET WITH REGEX');
}
