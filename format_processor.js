const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const data = JSON.parse(fs.readFileSync('unformatted_updates.json', 'utf8'));

function formatContent(content) {
  // Strip out old HTML wrapper tags
  let text = content.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '\n\n').replace(/<div[^>]*>[\s\S]*?<\/div>/g, '');
  
  // Clean up extra newlines
  text = text.replace(/\n{3,}/g, '\n\n').trim();
  
  let blocks = text.split(/\n\n+/);
  let formattedBlocks = [];
  
  blocks.forEach(block => {
    block = block.trim();
    if (!block) return;
    
    // Check if it's a list (contains lines starting with emojis, dashes, or numbers)
    const lines = block.split('\n').map(l => l.trim()).filter(l => l);
    
    const listPattern = /^([✅✔📍📞💬✨💡🌟🌈💪🏥📱🌿✔️🎁🌼💖🌸🩺🚫⚡🏃‍♂️🎾🏅🕒🚀🔹]|1\.|2\.|3\.|4\.|5\.|6\.|7\.|8\.|9\.|10\.|-)/;
    
    let isList = false;
    let listLines = [];
    let normalLines = [];
    
    lines.forEach(line => {
      if (listPattern.test(line) || line.includes(':')) {
        // sometimes lines are "Muscle Strain Prevention: Physiotherapy can help..."
        // but let's be careful. Let's just rely on emojis or bullet points or explicit newlines that look like lists
      }
    });

    // Better heuristic for lists:
    const listLikeLines = lines.filter(l => listPattern.test(l) || (l.length < 100 && lines.length > 2));
    
    if (listLikeLines.length >= lines.length / 2 && lines.length > 1) {
      isList = true;
    }
    
    if (isList) {
      let listHtml = '<ul>\n';
      lines.forEach(line => {
         let cleanLine = line.replace(/^[✅✔📍📞💬✨💡🌟🌈💪🏥📱🌿✔️🎁🌼💖🌸🩺🚫⚡🏃‍♂️🎾🏅🕒🚀🔹\-\d\.]+\s*/, '');
         if(cleanLine) {
           listHtml += `  <li>${line}</li>\n`;
         }
      });
      listHtml += '</ul>';
      formattedBlocks.push(listHtml);
    } else {
      // Is it a heading?
      if (block.length < 100 && !block.endsWith('.') && !block.endsWith('?') && !block.endsWith('!') && lines.length === 1) {
        formattedBlocks.push(`<h2>${block}</h2>`);
      } else {
        formattedBlocks.push(`<p>${block.replace(/\n/g, '<br>')}</p>`);
      }
    }
  });

  return formattedBlocks.join('\n');
}

async function run() {
  for (const update of data) {
    if (!update.content) continue;
    const formatted = formatContent(update.content);
    console.log(`\n\n--- Formatting ID: ${update.id} ---`);
    console.log(formatted);
    
    // Optional: save to db
    const { error } = await supabase
      .from('updates')
      .update({ content: formatted })
      .eq('id', update.id);
      
    if (error) {
      console.error('Error updating', update.id, error);
    } else {
      console.log('Updated', update.id);
    }
  }
}

run();
