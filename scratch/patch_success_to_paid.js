const fs = require('fs');
const p = 'frontend/web/index.html';
let content = fs.readFileSync(p, 'utf8');

// The string we want to replace is exactly:
//                 // Update ebook_users record status and payment ID
//                 const { error: ebUpdateError } = await window.supabaseClient.from('ebook_users')
//                   .update({
//                     payment_status: 'success',
//                     razorpay_payment_id: response.razorpay_payment_id,
//                     razorpay_order_id: response.razorpay_order_id || null
//                   })

const target = `                // Update ebook_users record status and payment ID
                const { error: ebUpdateError } = await window.supabaseClient.from('ebook_users')
                  .update({
                    payment_status: 'success',
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id || null
                  })`;

const replacement = `                // Update ebook_users record status and payment ID
                const { error: ebUpdateError } = await window.supabaseClient.from('ebook_users')
                  .update({
                    payment_status: 'paid',
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id || null
                  })`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(p, content);
    console.log('SUCCESS: Changed success to paid for ebook_users.');
} else {
    // try line by line replacement if exact block fails
    let lines = content.split('\n');
    let replaced = false;
    for(let i=0; i<lines.length; i++) {
        if(lines[i].includes(".from('ebook_users')") && lines[i+1] && lines[i+1].includes(".update({")) {
             if(lines[i+2] && lines[i+2].includes("payment_status: 'success',")) {
                 lines[i+2] = lines[i+2].replace("'success'", "'paid'");
                 replaced = true;
             }
        }
    }
    if(replaced) {
        fs.writeFileSync(p, lines.join('\n'));
        console.log('SUCCESS: Replaced via line by line array method.');
    } else {
        console.log('FAILED TO FIND TARGET STRING FOR SUCCESS TO PAID');
    }
}
