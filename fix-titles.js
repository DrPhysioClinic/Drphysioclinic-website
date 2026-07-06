const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function cleanTitles() {
  console.log("Stripping '| Dr Physio' suffixes...");
  const tables = ['services', 'conditions', 'updates', 'areas', 'doctors'];
  const regex = /\s*[|-]\s*Dr Physio( Clinic)?\s*$/i;

  for (const t of tables) {
    const { data } = await supabase.from(t).select('id, slug, title, seo_title');
    if (!data) continue;
    
    for (const row of data) {
      let needsUpdate = false;
      const updates = {};
      
      if (row.title && regex.test(row.title)) {
        updates.title = row.title.replace(regex, '').trim();
        needsUpdate = true;
      }
      
      if (row.seo_title && regex.test(row.seo_title)) {
        updates.seo_title = row.seo_title.replace(regex, '').trim();
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        console.log(`Updating [${t}] ${row.slug}:`, updates);
        const { error } = await supabase.from(t).update(updates).eq('id', row.id);
        if (error) console.error("Error:", error);
      }
    }
  }
}

async function fixDuplicates() {
  console.log("\nFixing duplicates in updates table...");
  const { data } = await supabase.from('updates').select('id, slug, title, seo_title, contentPreview:content, is_published');
  
  const junkSlugs = [
    'say-goodbye-to-hip-pain-welcome-to-dr-physio-p',
    'dr-physio-affordable-home-visit-physiotherap',
    'dr-physio-best-physiotherapy-rehab-center-i',
    'say-goodbye-to-back-pain-get-back-to-living-yo',
    'battling-chronic-neck-pain-it-s-time-to-take-a',
    'you-re-in-your-40s-and-it-s-the-perfect-time-t',
    'dushyant-bhai-recovered-from-severe-neck-pain'
  ];

  for (const row of data) {
    let updates = {};
    let needsUpdate = false;

    // Unpublish messy duplicates
    if (junkSlugs.includes(row.slug) && row.is_published) {
      updates.is_published = false;
      needsUpdate = true;
      console.log(`Unpublishing duplicate: ${row.slug}`);
    }

    // Fix cross-table collision
    if (row.slug === 'child-development-center' && row.title.toLowerCase() === 'child development center') {
      updates.title = "Updates from our Child Development Center";
      updates.seo_title = "Updates from our Child Development Center";
      needsUpdate = true;
      console.log(`Renaming cross-table collision: ${row.slug}`);
    }

    // Fix "No Title" (or missing title)
    if (!row.title || row.title.trim().toLowerCase() === 'no title' || !row.seo_title || row.seo_title.trim().toLowerCase() === 'no title') {
      let newTitle = row.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      
      // If content exists, try to extract first sentence if slug is ugly
      if (row.slug.length > 30 && row.contentPreview) {
          const stripped = row.contentPreview.replace(/<[^>]*>?/gm, '').trim();
          if (stripped.length > 5) {
             const firstSentence = stripped.split(/[.?!]/)[0].substring(0, 50).trim();
             if (firstSentence) {
                 newTitle = firstSentence;
             }
          }
      }

      updates.title = newTitle;
      updates.seo_title = newTitle;
      needsUpdate = true;
      console.log(`Renaming 'No Title' on ${row.slug} to -> ${newTitle}`);
    }

    if (needsUpdate) {
      const { error } = await supabase.from('updates').update(updates).eq('id', row.id);
      if (error) console.error("Error:", error);
    }
  }
}

async function run() {
  await cleanTitles();
  await fixDuplicates();
  console.log("Done database fixes!");
}

run();
