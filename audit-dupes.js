const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function getAllRows() {
  const allRows = [];
  
  const tables = ['services', 'conditions', 'updates', 'areas', 'doctors'];
  for (const t of tables) {
    const { data } = await supabase.from(t).select('id, slug, title, seo_title, seo_description, is_published').eq('is_published', true);
    if (data) {
      data.forEach(r => {
        allRows.push({
          table: t,
          id: r.id,
          slug: r.slug,
          title: r.title,
          seo_title: r.seo_title,
          seo_description: r.seo_description
        });
      });
    }
  }
  return allRows;
}

async function findDupes() {
  const rows = await getAllRows();
  
  const titles = {};
  const seoTitles = {};
  const desc = {};
  
  rows.forEach(r => {
    const t = (r.title || '').trim().toLowerCase();
    const st = (r.seo_title || '').trim().toLowerCase();
    const sd = (r.seo_description || '').trim().toLowerCase();
    
    if (t) { titles[t] = titles[t] || []; titles[t].push(`/${r.table}/${r.slug}`); }
    if (st) { seoTitles[st] = seoTitles[st] || []; seoTitles[st].push(`/${r.table}/${r.slug}`); }
    if (sd) { desc[sd] = desc[sd] || []; desc[sd].push(`/${r.table}/${r.slug}`); }
  });
  
  console.log("--- DUPLICATE TITLES (H1s) ---");
  for (const [k, v] of Object.entries(titles)) {
    if (v.length > 1) console.log(`[${v.length}] "${k}" -> ${v.join(', ')}`);
  }
  
  console.log("\n--- DUPLICATE SEO TITLES ---");
  for (const [k, v] of Object.entries(seoTitles)) {
    if (v.length > 1) console.log(`[${v.length}] "${k}" -> ${v.join(', ')}`);
  }
  
  console.log("\n--- DUPLICATE SEO DESCRIPTIONS ---");
  for (const [k, v] of Object.entries(desc)) {
    if (v.length > 1) console.log(`[${v.length}] "${k}" -> ${v.join(', ')}`);
  }
}
findDupes();
