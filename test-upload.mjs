import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import 'dotenv/config';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function uploadLogo() {
  const filePath = './public/Dr physio logo combined.png';
  const fileData = fs.readFileSync(filePath);
  
  const { data, error } = await supabase.storage
    .from('media')
    .upload('Dr-physio-logo-combined.png', fileData, {
      contentType: 'image/png',
      upsert: true
    });

  if (error) {
    console.error("Upload error:", error);
  } else {
    console.log("Upload success:", data);
    const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl('Dr-physio-logo-combined.png');
    console.log("Public URL:", publicUrlData.publicUrl);
  }
}

uploadLogo();
