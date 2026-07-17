const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const data = JSON.parse(fs.readFileSync('unformatted_updates.json', 'utf8'));

async function run() {
  for (const update of data) {
    if (!update.content) continue;
    const { error } = await supabase
      .from('updates')
      .update({ content: update.content })
      .eq('id', update.id);
      
    if (error) {
      console.error('Error restoring', update.id, error);
    } else {
      console.log('Restored', update.id);
    }
  }
}

run();
