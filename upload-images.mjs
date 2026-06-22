import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const client = createClient(supabaseUrl, supabaseServiceKey);
const BUCKET = 'media';

async function main() {
  const data = JSON.parse(fs.readFileSync('./dr_physio_images.json', 'utf-8'));
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const item of data) {
    // Extract slug from URL, e.g., https://.../latest-update/best-physiotherapy-in-bopal/131
    const parts = item.url.split('/').filter(Boolean);
    const slug = parts[parts.length - 2]; 

    if (!slug) {
      console.log(`Could not derive slug from URL: ${item.url}`);
      errorCount++;
      continue;
    }

    try {
      // 1. Check if update exists
      const { data: updateData, error: updateErr } = await client
        .from('updates')
        .select('id, title, image_url')
        .eq('slug', slug)
        .single();

      if (updateErr || !updateData) {
        console.log(`[SKIP] No matching update found in DB for slug: ${slug}`);
        skipCount++;
        continue;
      }

      // If it already has an image from Supabase, maybe skip? Let's just overwrite for safety
      if (updateData.image_url && updateData.image_url.includes('supabase.co')) {
        console.log(`[SKIP] Already has Supabase image: ${slug}`);
        skipCount++;
        continue;
      }

      console.log(`[PROCESS] Found match: ${updateData.title} -> Downloading image...`);
      
      // 2. Download image
      const res = await fetch(item.image_url);
      if (!res.ok) throw new Error(`Failed to download image: ${res.statusText}`);
      
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = res.headers.get('content-type') || 'image/jpeg';
      
      // 3. Upload to Supabase Storage
      const ext = contentType.split('/')[1] || 'jpg';
      const path = `updates/${slug}-${Date.now()}.${ext}`;
      
      const { data: uploadData, error: uploadErr } = await client.storage
        .from(BUCKET)
        .upload(path, buffer, {
          contentType,
          upsert: true
        });

      if (uploadErr) throw uploadErr;

      // 4. Get public URL
      const { data: publicUrlData } = client.storage.from(BUCKET).getPublicUrl(path);
      const finalUrl = publicUrlData.publicUrl;

      // 5. Update database record
      const { error: dbErr } = await client
        .from('updates')
        .update({ image_url: finalUrl })
        .eq('slug', slug);

      if (dbErr) throw dbErr;

      console.log(`[SUCCESS] Updated ${slug} with image URL!`);
      successCount++;
    } catch (err) {
      console.error(`[ERROR] Failed to process ${slug}:`, err.message);
      errorCount++;
    }
  }

  console.log(`\nDONE! Success: ${successCount}, Skipped: ${skipCount}, Errors: ${errorCount}`);
}

main();
