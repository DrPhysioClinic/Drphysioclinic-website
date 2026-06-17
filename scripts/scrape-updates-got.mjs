import { gotScraping } from 'got-scraping';
import * as cheerio from 'cheerio';
import fs from 'fs';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function fetchHtml(url) {
    const res = await gotScraping({
        url,
        https: { rejectUnauthorized: false }
    });
    return res.body;
}

async function scrape() {
    let allUpdates = [];
    let page = 1; 
    let hasMore = true;

    // Load existing so we can append or continue
    let existingUrls = new Set();
    if (fs.existsSync('scraped_updates.json')) {
        const existing = JSON.parse(fs.readFileSync('scraped_updates.json', 'utf8'));
        existing.forEach(u => existingUrls.add(u.url));
        allUpdates = existing;
        console.log(`Loaded ${allUpdates.length} existing updates`);
    }

    // Try to find the max page if we already scraped some to resume properly
    // or just iterate from 1 and skip existing
    
    while (hasMore) {
        console.log(`Fetching list page ${page}...`);
        
        let html;
        try {
            html = await fetchHtml(`https://www.drphysioclinic.com/latest-updates/${page}`);
        } catch (e) {
            console.error(`Error fetching list page ${page}:`, e.message);
            // If 404, we assume no more pages
            if (e.response && e.response.statusCode === 404) {
                console.log("Got 404. Finished pagination.");
                break;
            }
            break;
        }
        
        if (html.includes('SafeLine WAF') || html.includes('slg-warning')) {
            console.error('WAF blocked us on list page! Stopping.');
            break;
        }

        const $ = cheerio.load(html);
        
        const updateElements = $('.updateContainer');
        if (updateElements.length === 0) {
            console.log("No more updates found on list page. Finished pagination.");
            hasMore = false;
            break;
        }

        const pageData = [];
        updateElements.each((i, el) => {
            const url = $(el).find('a.view-update-details').attr('href');
            const title = $(el).find('.updateText').text().trim();
            if (url && !existingUrls.has(url)) {
                pageData.push({ url, title });
                existingUrls.add(url);
            }
        });

        for (const item of pageData) {
            await delay(2000); 
            console.log(`Fetching detail page: ${item.url}`);
            let detailHtml;
            try {
                detailHtml = await fetchHtml(item.url);
            } catch (e) {
                console.error(`Error fetching detail page ${item.url}:`, e.message);
                continue;
            }
            
            if (detailHtml.includes('SafeLine WAF') || detailHtml.includes('slg-warning')) {
                console.error('WAF blocked us on detail page! Stopping.');
                hasMore = false;
                break;
            }

            const $d = cheerio.load(detailHtml);
            
            let contentHtml = $d('.updateContent').html();
            let excerpt = $d('.updateContent').text().trim().substring(0, 150);
            
            if (!contentHtml) {
                contentHtml = $d('.col-md-12 p').parent().html();
                excerpt = $d('.col-md-12 p').text().trim().substring(0, 150);
            }
            if (!contentHtml) {
                contentHtml = $d('.container').first().html(); 
            }

            allUpdates.push({
                title: item.title,
                url: item.url,
                excerpt: excerpt || item.title,
                content: contentHtml || item.title,
                slug: item.url.split('/').slice(-2)[0] || `update-${Date.now()}`,
                is_published: true
            });
            fs.writeFileSync('scraped_updates.json', JSON.stringify(allUpdates, null, 2));
        }

        if (!hasMore) break;

        page++;
        if (page > 200) break;
        await delay(3000); 
    }

    console.log(`Scraped ${allUpdates.length} updates total. Data saved to scraped_updates.json`);
}

scrape().catch(console.error);
