const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function findGlobal() {
  const tables = ['services', 'conditions', 'doctors', 'areas', 'updates'];
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*');
    if (!data) continue;

    for (const row of data) {
        for (const [key, value] of Object.entries(row)) {
            if (typeof value === 'string' && value.includes('Replecement')) {
                console.log(`FOUND in table ${t}, row ${row.slug || row.id}, field ${key}: ${value}`);
                // Fix it
                const updates = {};
                updates[key] = value.replace(/Replecement/g, 'Replacement');
                await supabase.from(t).update(updates).eq('id', row.id);
            }
            if (Array.isArray(value)) {
                let changed = false;
                const newArr = value.map(v => {
                    if (typeof v === 'string' && v.includes('Replecement')) {
                        changed = true;
                        return v.replace(/Replecement/g, 'Replacement');
                    }
                    return v;
                });
                if (changed) {
                    console.log(`FOUND in table ${t}, row ${row.slug || row.id}, field ${key} (Array)`);
                    const updates = {};
                    updates[key] = newArr;
                    await supabase.from(t).update(updates).eq('id', row.id);
                }
            }
        }
    }
  }
}
findGlobal();
