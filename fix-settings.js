const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixSettings() {
  const newName = "Dr Physio \u2013 Physiotherapy, Sports Injury Clinic, Fitness Studio & Child Development Center";
  
  const { error } = await supabase.from('settings').update({ clinic_name: newName }).eq('id', '62782337-2c8e-410a-ba80-d0f222fd3502');
  if (error) {
    console.error(error);
  } else {
    console.log("Successfully updated settings table.");
  }
}
fixSettings();
