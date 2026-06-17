process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import * as cheerio from 'cheerio';
import fs from 'fs';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function fetchHtml(url) {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
        }
    });
    return await res.text();
}

async function scrape() {
    let allUpdates = [];
    let page = 4; // Start from page 4 because 1-3 are done
    let hasMore = true;

    // Load existing so we can append or continue
    let existingUrls = new Set();
    if (fs.existsSync('scraped_updates.json')) {
        const existing = JSON.parse(fs.readFileSync('scraped_updates.json', 'utf8'));
        existing.forEach(u => existingUrls.add(u.url));
        allUpdates = existing;
        console.log(`Loaded ${allUpdates.length} existing updates`);
    }

    while (hasMore) {
        console.log(`Fetching list page ${page}...`);
        const html = await fetchHtml(`https://www.drphysioclinic.com/latest-updates/${page}`);
        
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
            await delay(4000); // 4 seconds delay to avoid WAF
            console.log(`Fetching detail page: ${item.url}`);
            const detailHtml = await fetchHtml(item.url);
            
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
        await delay(5000); // 5 second delay between list pages
    }

    console.log(`Scraped ${allUpdates.length} updates total. Data saved to scraped_updates.json`);
}

scrape().catch(console.error);
