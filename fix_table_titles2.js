const SUPABASE_URL = 'https://rlqmdylbzapyepuwncwt.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscW1keWxiemFweWVwdXduY3d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNTcwNzYsImV4cCI6MjA5MTgzMzA3Nn0.oNNK1pwLnykQlNfUkw7IdB-ZBkKDoWxszsKDSIjsLeo';

async function run() {
  const getRes = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts`, {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_ANON,
      'Authorization': `Bearer ${SUPABASE_ANON}`
    }
  });

  const posts = await getRes.json();
  if (!posts || posts.length === 0) {
    console.error('No posts found');
    return;
  }

  for (const post of posts) {
    if (!post.content) continue;
    let content = post.content;
    let modified = false;

    // We used: style="color:#000;"
    // Let's replace it with: style="color:#000 !important;"
    
    if (content.includes('color:#000;')) {
      content = content.replace(/color:#000;/g, 'color:#000 !important;');
      modified = true;
    }
    if (content.includes('color: #000;')) {
      content = content.replace(/color: #000;/g, 'color: #000 !important;');
      modified = true;
    }

    if (modified) {
      const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?id=eq.${post.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON,
          'Authorization': `Bearer ${SUPABASE_ANON}`
        },
        body: JSON.stringify({ content })
      });

      if (patchRes.ok) {
        console.log(`Updated post: ${post.title}`);
      } else {
        console.error(`Failed to update post: ${post.title}`, await patchRes.text());
      }
    }
  }
}

run();
