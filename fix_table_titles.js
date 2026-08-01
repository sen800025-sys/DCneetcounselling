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

    // We used: <tr style="background-color:#f2f2f2;">
    // Let's replace it with: <tr style="background-color:#f2f2f2; color:#000;">
    if (content.includes('background-color:#f2f2f2;"')) {
      content = content.replace(/background-color:#f2f2f2;"/g, 'background-color:#f2f2f2; color:#000;"');
      modified = true;
    }
    
    // Also cover variants like space after colon
    if (content.includes('background-color: #f2f2f2;"')) {
      content = content.replace(/background-color: #f2f2f2;"/g, 'background-color: #f2f2f2; color: #000;"');
      modified = true;
    }

    // Let's also look for any <th> elements and ensure they have color black if they are inside a light background
    // Or just add inline style to all <th> that don't have color specified
    const thRegex = /<th([^>]*)>/g;
    content = content.replace(thRegex, (match, attr) => {
      if (!attr.includes('style=')) {
        modified = true;
        return `<th${attr} style="color:#000;">`;
      } else if (!attr.includes('color:')) {
        modified = true;
        return match.replace('style="', 'style="color:#000; ');
      }
      return match;
    });

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
