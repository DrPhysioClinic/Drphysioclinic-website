const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixPost() {
  const updates = {
    slug: 'never-too-late-to-start-in-your-40s',
    title: "You're in Your 40s — And It's the Perfect Time to Take Care of You",
    seo_title: "You're in Your 40s — And It's the Perfect Time to Take Care of You"
  };
  
  const { error } = await supabase.from('updates').update(updates).eq('slug', 's-never-too-late-to-start-ready-to-feel-bett');
  if (error) {
    console.error(error);
  } else {
    console.log("Successfully updated post in database.");
  }
}
fixPost();
