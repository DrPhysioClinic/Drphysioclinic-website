const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixFacebook() {
  const { error } = await supabase.from('social_links').update({ url: 'https://www.facebook.com/p/Dr-Physio-Ahmedabad-100063803683465/' }).eq('platform', 'Facebook');
  if (error) {
    console.error(error);
  } else {
    console.log("Successfully updated Facebook URL.");
  }
}
fixFacebook();
