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

    // Regex to match a tag that has Download in it and has style attribute.
    // Actually, we can just replace known button styles or do a more robust regex.
    // For example, replace background:#FFC107 with background:#28a745
    // and color:#000 with color:#ffffff on buttons.
    // Let's just find anchor tags containing 'Download' and replace their background and color styles.

    const anchorRegex = /<a [^>]*style="([^"]*)"[^>]*>([\s\S]*?Download[\s\S]*?)<\/a>/gi;
    
    content = content.replace(anchorRegex, (match, style, innerText) => {
      let newStyle = style;
      
      // replace background
      newStyle = newStyle.replace(/background(-color)?\s*:\s*[^;]+;/gi, 'background:#28a745;');
      // replace color
      newStyle = newStyle.replace(/color\s*:\s*[^;]+;/gi, 'color:#ffffff;');
      
      // If background was not in style, add it
      if (!/background(-color)?\s*:/.test(style)) {
        newStyle += 'background:#28a745;';
      }
      // If color was not in style, add it
      if (!/color\s*:/.test(style)) {
        newStyle += 'color:#ffffff;';
      }

      if (style !== newStyle) {
        modified = true;
        return match.replace(style, newStyle);
      }
      return match;
    });
    
    // Also specifically fix the one we just made if the regex missed it
    if (content.includes('background:#FFC107;color:#000;')) {
      content = content.replace(/background:#FFC107;color:#000;/g, 'background:#28a745;color:#ffffff;');
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
