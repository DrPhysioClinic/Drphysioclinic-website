import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Missing GEMINI_API_KEY in .env.local");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
  systemInstruction: `You are an expert web content formatter for a premium physiotherapy clinic.
Your task is to take a chunk of unformatted text and convert it into structured HTML.
Use <h2> tags for section titles, <p> for paragraphs, <blockquote> for highlighted summary or introductory text, and <ul>/<li> for lists.
Do NOT use <h1> tags (the page title is already H1).
Keep the original wording but fix obvious typos. Do not add random extra content.
Format it beautifully exactly like this example structure:
<h2>Understanding [Topic]</h2>
<blockquote>A compelling introductory sentence or summary.</blockquote>
<p>Paragraph text...</p>
<h2>Why choose [Topic]?</h2>
<ul>
  <li><strong>Benefit 1:</strong> Description...</li>
  <li><strong>Benefit 2:</strong> Description...</li>
</ul>
Return ONLY the raw HTML string without any markdown wrappers like \`\`\`html.`,
});

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithRetry(text: string, retries = 5, backoff = 15000): Promise<any> {
  try {
    return await model.generateContent({
      contents: [{ role: "user", parts: [{ text }] }],
      generationConfig: {
        temperature: 0.2,
      },
    });
  } catch (error: any) {
    if (error.status === 429 && retries > 0) {
      console.log(`Rate limited! Waiting ${backoff / 1000}s before retrying...`);
      await delay(backoff);
      return generateWithRetry(text, retries - 1, backoff * 1.5);
    }
    throw error;
  }
}

async function main() {
  console.log("Fetching updates from Supabase...");
  const { data: updates, error } = await supabase
    .from("updates")
    .select("id, title, slug, content");

  if (error) {
    console.error("Error fetching updates:", error);
    process.exit(1);
  }

  console.log(`Found ${updates.length} updates. Processing...`);

  let count = 0;
  for (const update of updates) {
    if (!update.content || update.content.includes("<h2>")) {
      console.log(`Skipping ${update.slug} (already formatted or empty)`);
      continue;
    }

    try {
      console.log(`Formatting: ${update.title} (${update.slug})...`);
      
      const response = await generateWithRetry(update.content);

      let formattedHtml = response.response.text().trim();
      
      // Strip markdown code blocks if the model accidentally includes them
      if (formattedHtml.startsWith("\`\`\`html")) {
        formattedHtml = formattedHtml.replace(/^\`\`\`html/, "").replace(/\`\`\`$/, "").trim();
      } else if (formattedHtml.startsWith("\`\`\`")) {
        formattedHtml = formattedHtml.replace(/^\`\`\`/, "").replace(/\`\`\`$/, "").trim();
      }

      const { error: updateError } = await supabase
        .from("updates")
        .update({ content: formattedHtml })
        .eq("id", update.id);

      if (updateError) {
        console.error(`Failed to update DB for ${update.slug}:`, updateError);
      } else {
        console.log(`✅ Success: ${update.slug}`);
        count++;
      }

      // 15 seconds delay to stay well under the 5 RPM free tier limit
      await delay(15000);
      
    } catch (err) {
      console.error(`❌ Error formatting ${update.slug}:`, err);
    }
  }

  console.log(`\n🎉 Finished formatting ${count} updates!`);
}

main();
