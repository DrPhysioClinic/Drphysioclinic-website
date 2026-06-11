import * as https from "https";
import * as cheerio from "cheerio";
import fetch from "node-fetch";

const agent = new https.Agent({ rejectUnauthorized: false });

async function run() {
  const response = await fetch("https://www.drphysioclinic.com", { agent });
  const html = await response.text();
  const $ = cheerio.load(html);
  
  let foundState = false;
  $("script").each((i, el) => {
    const text = $(el).html() || "";
    if (text.includes("window.") || text.includes("product") || text.includes("service")) {
        if (text.length > 500) {
            console.log(`Script ${i} might contain data. Length=${text.length}`);
            foundState = true;
        }
    }
  });
  
  if (!foundState) {
    console.log("No large data scripts found.");
  }
}

run().catch(console.error);
