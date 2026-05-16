const fs = require('fs');
const p = 'frontend/web/index.html';
let content = fs.readFileSync(p, 'utf8');

const target = `            if (dataVerify.success) {
                window.location.href = \`/thank-you/?product=\${encodeURIComponent(ctx.course + " (" + ctx.quota + ")")}&amount=0&order_id=\${order.order_id}&wallet_only=1\`;
                return;
            }`;

const replacement = `            if (dataVerify.success) {
                if (window.supabaseClient) {
                    await window.supabaseClient.from('ebook_users').update({
                        payment_status: 'paid',
                        razorpay_payment_id: order.order_id,
                        razorpay_order_id: order.order_id
                    }).eq('email', email).eq('course', ctx.course).eq('payment_status', 'initiated');
                }
                window.location.href = \`/thank-you/?product=\${encodeURIComponent(ctx.course + " (" + ctx.quota + ")")}&amount=0&order_id=\${order.order_id}&wallet_only=1\`;
                return;
            }`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(p, content);
    console.log('SUCCESS: Patched wallet_only ebook_users update.');
} else {
    // If quote differences, try regex
    let lines = content.split('\n');
    let replaced = false;
    for(let i=0; i<lines.length; i++) {
        if(lines[i].includes('if (dataVerify.success) {') && lines[i+1] && lines[i+1].includes('window.location.href = `/thank-you/')) {
            lines.splice(i+1, 0, 
                "                if (window.supabaseClient) {",
                "                    await window.supabaseClient.from('ebook_users').update({",
                "                        payment_status: 'paid',",
                "                        razorpay_payment_id: order.order_id,",
                "                        razorpay_order_id: order.order_id",
                "                    }).eq('email', email).eq('course', ctx.course).eq('payment_status', 'initiated');",
                "                }"
            );
            replaced = true;
            break;
        }
    }
    if (replaced) {
        fs.writeFileSync(p, lines.join('\n'));
        console.log('SUCCESS: Patched wallet_only via array insert.');
    } else {
        console.log('FAILED TO FIND WALLET_ONLY TARGET.');
    }
}
