const SUPABASE_URL = 'https://rlqmdylbzapyepuwncwt.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscW1keWxiemFweWVwdXduY3d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNTcwNzYsImV4cCI6MjA5MTgzMzA3Nn0.oNNK1pwLnykQlNfUkw7IdB-ZBkKDoWxszsKDSIjsLeo';
const slug = 'neet-ug-2026-re-exam-answer-key-released';

async function run() {
  const getRes = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?slug=eq.${slug}`, {
    headers: {
      'apikey': SUPABASE_ANON,
      'Authorization': `Bearer ${SUPABASE_ANON}`
    }
  });
  
  if (!getRes.ok) {
    console.error('Failed to fetch', await getRes.text());
    return;
  }
  
  const posts = await getRes.json();
  if (posts.length === 0) {
    console.error('Post not found');
    return;
  }
  
  const post = posts[0];
  let newContent = post.content;
  
  // Replace markdown links with HTML links and make them highlighted/clickable
  newContent = newContent.replace(
    /\[https:\/\/neet\.nta\.nic\.in\/\]\(https:\/\/neet\.nta\.nic\.in\/\)/g, 
    '<a href="https://neet.nta.nic.in/" target="_blank" style="color: #2563eb; text-decoration: underline; font-weight: bold;">https://neet.nta.nic.in/</a>'
  );
  
  const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?id=eq.${post.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON,
      'Authorization': `Bearer ${SUPABASE_ANON}`
    },
    body: JSON.stringify({ content: newContent })
  });
  
  if (patchRes.ok) {
    console.log('Successfully updated blog post content');
  } else {
    console.error('Failed to update blog post', await patchRes.text());
  }
}

run();
