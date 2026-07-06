const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function getPost() {
  const { data, error } = await supabase.from('updates').select('id, slug, title, content, seo_title').eq('slug', 's-never-too-late-to-start-ready-to-feel-bett');
  if (error) console.error(error);
  else console.log(data);
}
getPost();
