import fs from 'fs';
import * as cheerio from 'cheerio';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function scrapeWayback() {
    const data = JSON.parse(fs.readFileSync('wayback.json', 'utf8'));
    // The first row is headers: ["urlkey","timestamp","original","mimetype","statuscode","digest","length"]
    const rows = data.slice(1);
    
    let allUpdates = [];
    if (fs.existsSync('scraped_updates.json')) {
        allUpdates = JSON.parse(fs.readFileSync('scraped_updates.json', 'utf8'));
    }
    const existingUrls = new Set(allUpdates.map(u => u.url));
    console.log(`Loaded ${existingUrls.size} existing updates`);

    let newFound = 0;
    
    for (const row of rows) {
        const [urlkey, timestamp, originalUrl, mimetype, statuscode, digest, length] = row;
        
        // Skip if we already have it
        if (existingUrls.has(originalUrl)) {
            continue;
        }

        // Must be a 200 OK page
        if (statuscode !== "200") continue;

        console.log(`Fetching from Wayback: ${originalUrl}`);
        const waybackUrl = `http://web.archive.org/web/${timestamp}/${originalUrl}`;
        
        try {
            const res = await fetch(waybackUrl);
            const html = await res.text();
            
            const $ = cheerio.load(html);
            
            // Wait, the title might be in .updateText or in the <h1>
            let title = $('.updateText').text().trim();
            if (!title) title = $('h1').first().text().trim() || "No Title";
            
            let contentHtml = $('.updateContent').html();
            let excerpt = $('.updateContent').text().trim().substring(0, 150);
            
            if (!contentHtml) {
                const p = $('.col-md-12 p');
                if (p.length > 0) {
                    contentHtml = p.parent().html();
                    excerpt = p.text().trim().substring(0, 150);
                } else {
                    const container = $('.container');
                    if (container.length > 0) contentHtml = container.html();
                }
            }

            if (!contentHtml) {
                console.log(`Could not find content for ${originalUrl}, skipping.`);
                continue;
            }

            allUpdates.push({
                title: title,
                url: originalUrl,
                excerpt: excerpt || title,
                content: contentHtml || title,
                slug: originalUrl.split('/').slice(-2)[0] || `update-${Date.now()}`,
                is_published: true
            });
            
            existingUrls.add(originalUrl);
            newFound++;
            fs.writeFileSync('scraped_updates.json', JSON.stringify(allUpdates, null, 2));

        } catch (e) {
            console.error(`Error fetching ${waybackUrl}: ${e.message}`);
        }
        
        await delay(500); // polite delay for wayback API
    }
    
    console.log(`Finished scraping Wayback! Added ${newFound} new updates. Total: ${allUpdates.length}`);
}

scrapeWayback().catch(console.error);
