import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertUpdates() {
  const data = JSON.parse(fs.readFileSync('scraped_updates.json', 'utf8'));
  console.log(`Read ${data.length} updates from file.`);

  let insertedCount = 0;
  for (const item of data) {
    // Basic clean up
    const title = item.title;
    const slug = item.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const excerpt = item.excerpt.substring(0, 250);
    const content = item.content;

    const { data: inserted, error } = await supabase
      .from('updates')
      .upsert({
        title,
        slug,
        excerpt,
        content,
        is_published: true,
        published_at: new Date().toISOString(),
      }, { onConflict: 'slug' });

    if (error) {
      console.error(`Error inserting ${title}:`, error);
    } else {
      console.log(`Inserted/Updated: ${title}`);
      insertedCount++;
    }
  }

  console.log(`Finished inserting ${insertedCount} updates.`);
}

insertUpdates().catch(console.error);
