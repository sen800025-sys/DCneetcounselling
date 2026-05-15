const fs = require('fs');
const path = 'c:\\Users\\rushi\\Downloads\\DCneetcounselling\\frontend\\web\\js\\app_v2.js';
let content = fs.readFileSync(path, 'utf8');

const regex = /var \{ data \} = await window\.supabaseClient\.auth\.getSession\(\);/g;
const replacement = `var data = null;
        try {
            var res = await window.supabaseClient.auth.getSession();
            data = res.data;
        } catch (e) {
            console.error("SESSION FETCH ERROR:", e);
        }`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    console.log("Patched try-catch logic successfully.");
    fs.writeFileSync(path, content, 'utf8');
} else {
    console.log("Could not find getSession() to patch.");
}
