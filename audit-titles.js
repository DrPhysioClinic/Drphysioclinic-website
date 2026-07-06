const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTable(tableName) {
  const { data } = await supabase.from(tableName).select('*').eq('is_published', true);
  if (!data) return;
  
  data.forEach(row => {
    const title = row.seo_title || row.title || '';
    if (title.toLowerCase().includes('dr physio')) {
      console.log(`[${tableName}] Double branding found: ${row.slug} -> "${title}"`);
    }
  });
}

async function run() {
  await checkTable('services');
  await checkTable('conditions');
  await checkTable('updates');
  await checkTable('areas');
  await checkTable('doctors');
}
run();
