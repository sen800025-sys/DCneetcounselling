const SUPABASE_URL = 'https://rlqmdylbzapyepuwncwt.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscW1keWxiemFweWVwdXduY3d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNTcwNzYsImV4cCI6MjA5MTgzMzA3Nn0.oNNK1pwLnykQlNfUkw7IdB-ZBkKDoWxszsKDSIjsLeo';

async function run() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?select=content&slug=eq.mcc-neet-ug-aiq-counselling-schedule-2026`, {
    headers: {
      'apikey': SUPABASE_ANON,
      'Authorization': `Bearer ${SUPABASE_ANON}`
    }
  });
  const data = await res.json();
  console.log(data[0].content);
}
run();
