const SUPABASE_URL = 'https://rlqmdylbzapyepuwncwt.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscW1keWxiemFweWVwdXduY3d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNTcwNzYsImV4cCI6MjA5MTgzMzA3Nn0.oNNK1pwLnykQlNfUkw7IdB-ZBkKDoWxszsKDSIjsLeo';

async function run() {
  const getRes = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?slug=eq.mcc-neet-ug-aiq-counselling-schedule-2026`, {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_ANON,
      'Authorization': `Bearer ${SUPABASE_ANON}`
    }
  });

  const posts = await getRes.json();
  if (posts.length > 0) {
    const content = posts[0].content;
    const tableIndex = content.indexOf('<table');
    const tableEndIndex = content.indexOf('</table>') + 8;
    console.log(content.substring(tableIndex, tableEndIndex));
  } else {
    console.log("Post not found");
  }
}

run();
