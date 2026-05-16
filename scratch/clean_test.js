const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://rlqmdylbzapyepuwncwt.supabase.co';
const fs = require('fs');
const html = fs.readFileSync('frontend/web/index.html', 'utf8');
const anonKeyMatch = html.match(/const anonKey = ["']([^"']+)["']/);
const anonKey = anonKeyMatch ? anonKeyMatch[1] : '';

const supabase = createClient(supabaseUrl, anonKey);

async function clean() {
    await supabase.from('ebook_users').delete().eq('email', 'test@example.com');
    console.log("Cleanup done.");
}
clean();
