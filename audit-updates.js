const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function main() {
  require('dotenv').config({ path: '/Users/raahildesai/Raahil CP/Projects/Dr.physio.clinic/Dr-physio-landing-page/.env.local' });
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: updates, error } = await supabase
    .from('updates')
    .select('id, slug, title, content, is_published')
    .eq('is_published', true);

  if (error) {
    console.error('Error fetching updates:', error);
    return;
  }

  const junkSlugs = ['it', 'pain', 'ache', 'center', 'clinic', 'helps', 'used', 'warrior', 'sitting', 'friendly', 'stroke', 'factors', 'diagnosis', 'sunshinevitamin'];
  const truncatedSlugs = ['say-goodbye-to-hi', 'transform-your-fi', 'physiotherapy-is-ess', 'dushyant-bhai-rec'];
  
  const auditResults = {
    unpublish: [],
    fix: [],
    suspicious: []
  };

  for (const update of updates) {
    const slug = update.slug || '';
    const title = update.title || '';
    const content = update.content || '';

    let action = null;
    let reason = '';

    if (junkSlugs.includes(slug)) {
      action = 'unpublish';
      reason = 'Single word/garbage slug';
    } else if (slug.startsWith('update-178')) {
      action = 'unpublish';
      reason = 'Test/placeholder entry';
    } else if (slug.includes('got-it-here-s-the-updated-version')) {
      action = 'unpublish';
      reason = 'AI artifact leak';
    } else if (truncatedSlugs.includes(slug)) {
      action = 'fix';
      reason = 'Truncated slug';
    } else if (content.length < 150) {
      action = 'unpublish';
      reason = 'Empty or near-empty content';
    } else if (slug.length < 5 || slug.split('-').length === 1) {
       action = 'suspicious';
       reason = 'Short or single-word slug not explicitly listed';
    }

    if (action) {
      auditResults[action].push({
        id: update.id,
        slug: update.slug,
        title: update.title,
        contentPreview: content.substring(0, 100).replace(/\n/g, ' '),
        reason
      });
    }
  }

  fs.writeFileSync('/Users/raahildesai/.gemini/antigravity-ide/brain/74d28e80-c4db-4657-ad9f-31de71ed894e/scratch/audit-report.json', JSON.stringify(auditResults, null, 2));
  console.log(`Found ${auditResults.unpublish.length} to unpublish, ${auditResults.fix.length} to fix, ${auditResults.suspicious.length} suspicious.`);
}

main();
