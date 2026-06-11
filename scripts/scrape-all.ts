import * as https from "https";
import * as cheerio from "cheerio";
import fetch from "node-fetch";
import * as fs from "fs";

const agent = new https.Agent({ rejectUnauthorized: false });

async function scrapePage(url: string) {
  try {
    const response = await fetch(url, { agent });
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const items: any[] = [];
    
    // Finding standard listing items
    $("li.item, .list-item, article, .card").each((i, el) => {
       const title = $(el).find("h3, h2, h4, .title, strong").first().text().trim();
       const desc = $(el).find("p, .desc").text().replace(/\s+/g, " ").trim();
       const img = $(el).find("img").attr("src") || $(el).find("img").attr("data-src");
       
       if (title) {
         items.push({ title, desc, img });
       }
    });
    
    // If empty, let's dump body to see what we missed
    if (items.length === 0) {
        console.log("No standard items found. Trying fallback...");
        $("div").each((i, el) => {
           const heading = $(el).find("h3").first().text().trim();
           if(heading && $(el).text().length < 1000) {
             const desc = $(el).find("p").text().replace(/\s+/g, " ").trim();
             const img = $(el).find("img").attr("src");
             items.push({ title: heading, desc, img });
           }
        });
    }
    
    // Dedup
    const unique = items.filter((v,i,a)=>a.findIndex(t=>(t.title === v.title))===i);
    return unique.filter(i => i.title.length > 3);
  } catch (e) {
    console.error(`Failed to scrape ${url}`, e);
    return [];
  }
}

async function run() {
  console.log("Scraping Treatments...");
  const treatments = await scrapePage("https://www.drphysioclinic.com/all-treatment/1");
  console.log(`Found ${treatments.length} treatments.`);
  
  // Save to file
  fs.writeFileSync("scraped_data.json", JSON.stringify({ treatments }, null, 2));
  console.log("Saved to scraped_data.json");
}

run().catch(console.error);
