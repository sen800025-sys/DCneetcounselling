const slug = "neet-2026-state-quota-eligibility-state-wise-domicile-rules";

const SUPABASE_URL = 'https://rlqmdylbzapyepuwncwt.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscW1keWxiemFweWVwdXduY3d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNTcwNzYsImV4cCI6MjA5MTgzMzA3Nn0.oNNK1pwLnykQlNfUkw7IdB-ZBkKDoWxszsKDSIjsLeo';

async function run() {
  // First fetch the post
  const getRes = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?slug=eq.${slug}&select=*`, {
    headers: {
      'apikey': SUPABASE_ANON,
      'Authorization': `Bearer ${SUPABASE_ANON}`
    }
  });

  if (!getRes.ok) {
    console.error('Failed to fetch post', await getRes.text());
    return;
  }

  const posts = await getRes.json();
  if (posts.length === 0) {
    console.error('Post not found');
    return;
  }

  const post = posts[0];
  let content = post.content;

  // Replace the text based format with table
  const searchRegex = /<h3>Uttar Pradesh<\/h3><p>(.*?)<\/p><h3>Rajasthan<\/h3><p>(.*?)<\/p><h3>Madhya Pradesh<\/h3><p>(.*?)<\/p><h3>Maharashtra<\/h3><p>(.*?)<\/p><h3>Gujarat<\/h3><p>(.*?)<\/p><h3>Karnataka<\/h3><p>(.*?)<\/p><h3>Tamil Nadu<\/h3><p>(.*?)<\/p><h3>West Bengal<\/h3><p>(.*?)<\/p><h3>Delhi<\/h3><p>(.*?)<\/p><h3>Other States<\/h3><p>(.*?)<\/p>/s;
  
  const replacementTable = `
<div class="overflow-x-auto">
  <table border="1" cellpadding="10" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
    <thead>
      <tr>
        <th style="background-color: #f2f2f2; text-align: left;">State</th>
        <th style="background-color: #f2f2f2; text-align: left;">Domicile Rules / Eligibility Criteria Overview</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Uttar Pradesh</strong></td>
        <td>$1</td>
      </tr>
      <tr>
        <td><strong>Rajasthan</strong></td>
        <td>$2</td>
      </tr>
      <tr>
        <td><strong>Madhya Pradesh</strong></td>
        <td>$3</td>
      </tr>
      <tr>
        <td><strong>Maharashtra</strong></td>
        <td>$4</td>
      </tr>
      <tr>
        <td><strong>Gujarat</strong></td>
        <td>$5</td>
      </tr>
      <tr>
        <td><strong>Karnataka</strong></td>
        <td>$6</td>
      </tr>
      <tr>
        <td><strong>Tamil Nadu</strong></td>
        <td>$7</td>
      </tr>
      <tr>
        <td><strong>West Bengal</strong></td>
        <td>$8</td>
      </tr>
      <tr>
        <td><strong>Delhi</strong></td>
        <td>$9</td>
      </tr>
      <tr>
        <td><strong>Other States</strong></td>
        <td>$10</td>
      </tr>
    </tbody>
  </table>
</div>
  `.trim();

  const newContent = content.replace(searchRegex, replacementTable);

  if (newContent === content) {
    console.error('Replacement failed, regex did not match.');
    return;
  }

  const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?slug=eq.${slug}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON,
      'Authorization': `Bearer ${SUPABASE_ANON}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ content: newContent })
  });

  if (patchRes.ok) {
    console.log('Successfully updated blog post with table');
  } else {
    console.error('Failed to update blog post', await patchRes.text());
  }
}

run();
