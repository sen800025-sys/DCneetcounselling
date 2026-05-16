const fs = require('fs');
const p = 'frontend/web/index.html';
let content = fs.readFileSync(p, 'utf8');

const regex = /payment_status:\s*'initiated',\s*created_at:\s*new\s*Date\(\),\s*created_at_ist:\s*new\s*Date\(\)\.toLocaleString\('en-IN',\s*\{\s*timeZone:\s*'Asia\/Kolkata',\s*hour12:\s*true\s*\}\)/;
const replacement = "payment_status: 'initiated',\n          created_at: new Date().toISOString()";

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(p, content);
    console.log('SUCCESS');
} else {
    console.log('FAILED TO FIND TARGET WITH REGEX');
}
