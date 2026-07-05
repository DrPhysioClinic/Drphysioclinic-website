const { createClient } = require('@supabase/supabase-js');

async function main() {
  require('dotenv').config({ path: '.env.local' });
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const report = require('/Users/raahildesai/.gemini/antigravity-ide/brain/74d28e80-c4db-4657-ad9f-31de71ed894e/scratch/audit-report.json');

  console.log(`Unpublishing ${report.unpublish.length} junk entries...`);
  for (const item of report.unpublish) {
    const { error } = await supabase
      .from('updates')
      .update({ is_published: false })
      .eq('id', item.id);
    if (error) console.error(`Failed to unpublish ${item.slug}:`, error);
  }

  console.log(`Fixing ${report.fix.length} truncated entries...`);
  
  const fixes = {
    'say-goodbye-to-hi': { slug: 'say-goodbye-to-hip-pain', title: 'Say Goodbye to Hip Pain' },
    'physiotherapy-is-ess': { slug: 'physiotherapy-is-essential', title: 'Physiotherapy is Essential' },
    'transform-your-fi': { slug: 'transform-your-fitness-story', title: 'Transform Your Fitness Story' },
    'dushyant-bhai-rec': { slug: 'dushyant-bhai-recovered', title: 'Dushyant Bhai Recovered' }
  };

  for (const item of report.fix) {
    const fixData = fixes[item.slug];
    if (fixData) {
      const { error } = await supabase
        .from('updates')
        .update({ 
          slug: fixData.slug, 
          title: fixData.title 
        })
        .eq('id', item.id);
      if (error) console.error(`Failed to fix ${item.slug}:`, error);
    }
  }

  console.log('Done!');
}

main();
