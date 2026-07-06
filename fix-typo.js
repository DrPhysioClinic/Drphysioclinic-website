const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixTypo() {
  const { data, error } = await supabase.from('doctors').select('*');
  if (error) {
    console.error(error);
    return;
  }

  let found = false;
  for (const doc of data) {
    let updates = {};
    let needsUpdate = false;

    // Check common fields where it might appear
    ['specializations', 'bio', 'qualifications'].forEach(field => {
       if (doc[field] && typeof doc[field] === 'string') {
         if (doc[field].includes('Replecement')) {
           updates[field] = doc[field].replace(/Replecement/g, 'Replacement');
           needsUpdate = true;
         }
       }
       // If it's an array
       if (doc[field] && Array.isArray(doc[field])) {
           const updatedArray = doc[field].map(s => s.replace(/Replecement/g, 'Replacement'));
           if (JSON.stringify(updatedArray) !== JSON.stringify(doc[field])) {
               updates[field] = updatedArray;
               needsUpdate = true;
           }
       }
    });

    if (needsUpdate) {
      found = true;
      console.log(`Fixing typo for doctor ${doc.name}...`);
      await supabase.from('doctors').update(updates).eq('id', doc.id);
    }
  }
  
  if (!found) console.log("No typo found in doctors table.");
}

fixTypo();
