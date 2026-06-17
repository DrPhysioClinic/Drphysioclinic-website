import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import fs from 'fs';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function scrape() {
    let allUpdates = [];
    let pageNum = 1;
    let hasMore = true;

    // Load existing so we can append or continue
    let existingUrls = new Set();
    if (fs.existsSync('scraped_updates.json')) {
        const existing = JSON.parse(fs.readFileSync('scraped_updates.json', 'utf8'));
        existing.forEach(u => existingUrls.add(u.url));
        allUpdates = existing;
        console.log(`Loaded ${allUpdates.length} existing updates`);
    }

    const browser = await puppeteer.launch({
        headless: "new",
        ignoreHTTPSErrors: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    while (hasMore) {
        console.log(`Fetching list page ${pageNum}...`);
        
        let success = false;
        let html = '';
        try {
            await page.goto(`https://www.drphysioclinic.com/latest-updates/${pageNum}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
            html = await page.content();
            success = true;
        } catch (e) {
            console.error(`Error loading page ${pageNum}:`, e.message);
        }

        if (html.includes('SafeLine WAF') || html.includes('slg-warning')) {
            console.error('WAF blocked us on list page! Stopping.');
            break;
        }

        const $ = cheerio.load(html);
        
        const updateElements = $('.updateContainer');
        if (updateElements.length === 0) {
            console.log(`No more updates found on list page ${pageNum}. Finished pagination.`);
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
            await delay(1500); // 1.5 seconds delay
            console.log(`Fetching detail page: ${item.url}`);
            
            try {
                await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                html = await page.content();
            } catch(e) {
                console.error(`Error loading detail page ${item.url}:`, e.message);
                continue;
            }
            
            if (html.includes('SafeLine WAF') || html.includes('slg-warning')) {
                console.error('WAF blocked us on detail page! Stopping.');
                hasMore = false;
                break;
            }

            const $d = cheerio.load(html);
            
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
        }

        if (!hasMore) break;

        pageNum++;
        if (pageNum > 200) break;
        
        // Save incrementally
        fs.writeFileSync('scraped_updates.json', JSON.stringify(allUpdates, null, 2));
        await delay(2000); // 2 second delay between list pages
    }

    await browser.close();
    fs.writeFileSync('scraped_updates.json', JSON.stringify(allUpdates, null, 2));
    console.log(`Scraped ${allUpdates.length} updates. Data saved to scraped_updates.json`);
}

scrape().catch(console.error);
