import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const client = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await client.from('updates').select('title, content, image_url').limit(10);
  if (error) {
    console.error('Error fetching:', error);
    return;
  }
  
  let hasImagesInContent = false;
  console.log(`Checking ${data.length} updates...`);
  data.forEach(update => {
    const hasImg = update.content && update.content.includes('<img');
    console.log(`Update "${update.title}": has <img tag in content? ${hasImg}, current image_url: ${update.image_url}`);
    if (hasImg) hasImagesInContent = true;
  });
  
  console.log(`\nOverall has images in content: ${hasImagesInContent}`);
}

check();
