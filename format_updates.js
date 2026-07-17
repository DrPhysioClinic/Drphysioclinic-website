const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('updates')
    .select('id, title, content')
    .not('content', 'ilike', '%<h2>%');
    
  if (error) {
    console.error(error);
    return;
  }
  
  const fs = require('fs');
  fs.writeFileSync('unformatted_updates.json', JSON.stringify(data, null, 2));
  console.log(`Saved ${data.length} updates to unformatted_updates.json`);
}

run();
