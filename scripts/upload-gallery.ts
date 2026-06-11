import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

// Load from .env.local manually if running via tsx without next env loaded
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("Missing Supabase credentials in .env.local");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DIR_PATH = "/Users/raahildesai/Raahil CP/Projects/Dr.physio.clinic/src img/Dr physio/Content imgs";
const BUCKET = "media";

async function run() {
  console.log(`Starting gallery upload from: ${DIR_PATH}`);
  const files = fs.readdirSync(DIR_PATH);
  
  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    if (file.startsWith(".")) continue;
    
    const filePath = path.join(DIR_PATH, file);
    const ext = path.extname(file).toLowerCase();
    const isImage = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext);
    
    if (!isImage) continue;

    console.log(`Processing ${file}...`);
    const fileData = fs.readFileSync(filePath);
    
    // Upload to Supabase Storage
    const fileName = `gallery/${crypto.randomUUID()}${ext}`;
    const contentType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : (ext === '.png' ? 'image/png' : 'image/webp');
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, fileData, {
        contentType,
        upsert: true,
      });
      
    if (uploadError) {
      console.error(`Failed to upload ${file}:`, uploadError);
      failCount++;
      continue;
    }
    
    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    
    // Insert into gallery table
    const { error: insertError } = await supabase.from("gallery").insert({
      image_url: publicUrl,
      title: null,
      is_published: true,
      sort_order: 0,
    });
    
    if (insertError) {
      console.error(`Failed to insert ${file} into DB:`, insertError.message);
      failCount++;
    } else {
      console.log(`Success: ${file} -> ${publicUrl}`);
      successCount++;
    }
  }
  
  console.log(`Migration Complete: ${successCount} uploaded, ${failCount} failed.`);
}

run().catch(console.error);
