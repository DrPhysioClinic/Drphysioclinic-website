const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('settings').select('facebook_url, twitter_url, instagram_url, youtube_url, logo_url');
  if (error) console.error(error);
  else console.log(data);
}
check();
