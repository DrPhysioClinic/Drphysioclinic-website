import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase env vars!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateDates() {
    console.log("Loading datasets...");
    const data = JSON.parse(fs.readFileSync('scraped_updates.json', 'utf8'));
    const wayback = JSON.parse(fs.readFileSync('wayback.json', 'utf8'));
    
    const wbMap = new Map();
    wayback.slice(1).forEach(r => {
        // r[1] is timestamp like '20250904162802'
        const ts = r[1];
        const year = ts.substring(0, 4);
        const month = ts.substring(4, 6);
        const day = ts.substring(6, 8);
        const hour = ts.substring(8, 10);
        const min = ts.substring(10, 12);
        const sec = ts.substring(12, 14);
        const isoString = `${year}-${month}-${day}T${hour}:${min}:${sec}Z`;
        wbMap.set(r[2], isoString);
    });

    let currentSimulatedTime = Date.now();
    const msPerGap = 5 * 24 * 60 * 60 * 1000; // 5 days

    let updatedCount = 0;

    for (let i = 0; i < data.length; i++) {
        const update = data[i];
        let createdAt;

        if (wbMap.has(update.url)) {
            createdAt = wbMap.get(update.url);
        } else {
            // Assign sequential simulated date
            createdAt = new Date(currentSimulatedTime).toISOString();
            currentSimulatedTime -= msPerGap;
        }

        const slug = update.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Update database
        const { error } = await supabase
            .from('updates')
            .update({ published_at: createdAt, created_at: createdAt })
            .eq('slug', slug);

        if (error) {
            console.error(`Error updating date for ${update.title}:`, error.message);
        } else {
            updatedCount++;
            console.log(`Assigned date ${createdAt} to: ${update.title.substring(0, 30)}...`);
        }
    }

    console.log(`\nSuccessfully updated dates for ${updatedCount} updates!`);
}

updateDates().catch(console.error);
