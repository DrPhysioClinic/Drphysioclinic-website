const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSeo() {
  const tables = ['services', 'conditions', 'areas', 'settings', 'doctors'];
  const dataMap = {};
  
  for (const t of tables) {
    const { data } = await supabase.from(t).select('slug, title, seo_title, seo_description');
    if (data) dataMap[t] = data;
  }
  
  // also get static files via simple logic: we'll just dump all the seo fields to console 
  // and see if the keywords match
  const keywords = [
    "Physiotherapist in Ahmedabad",
    "Sports Injury Treatment Ahmedabad",
    "Neck Pain Physiotherapist Ahmedabad",
    "Back Pain Clinic Ahmedabad",
    "Shoulder Pain Treatment Ahmedabad",
    "Best Physiotherapist in Ahmedabad"
  ];
  
  const results = {};
  keywords.forEach(k => results[k] = []);
  
  for (const [table, rows] of Object.entries(dataMap)) {
      for (const row of rows) {
          const searchString = `${row.title || ''} ${row.seo_title || ''} ${row.seo_description || ''}`.toLowerCase();
          
          keywords.forEach(k => {
              // try to match the exact string, or close variations
              const kw = k.toLowerCase();
              if (searchString.includes(kw)) {
                  results[k].push(`[${table}] ${row.slug || 'settings'} - ${row.seo_title}`);
              } else {
                  // try an "AND" match of the key words
                  const parts = kw.split(' ');
                  const allMatch = parts.every(p => searchString.includes(p));
                  if (allMatch) {
                      results[k].push(`(fuzzy) [${table}] ${row.slug || 'settings'} - ${row.seo_title}`);
                  }
              }
          });
      }
  }
  
  console.log(JSON.stringify(results, null, 2));
}

checkSeo();
