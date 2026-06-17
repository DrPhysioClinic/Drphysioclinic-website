import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import fs from 'fs';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function scrapeViaLocalChrome() {
    console.log("Connecting to local Chrome on port 9222...");
    
    // Fetch the web socket debugger URL from the local Chrome instance
    const res = await fetch('http://127.0.0.1:9222/json/version');
    const versionData = await res.json();
    const wsEndpoint = versionData.webSocketDebuggerUrl;
    
    console.log(`WebSocket Endpoint: ${wsEndpoint}`);

    const browser = await puppeteer.connect({ browserWSEndpoint: wsEndpoint, defaultViewport: null });
    
    // Find the drphysioclinic tab
    const pages = await browser.pages();
    let targetPage = pages.find(p => p.url().includes('drphysioclinic.com/latest-updates'));
    
    if (!targetPage) {
        console.log("Creating new tab since no drphysioclinic tab found...");
        targetPage = await browser.newPage();
    } else {
        console.log("Found existing drphysioclinic tab!");
        await targetPage.bringToFront();
    }

    let allUpdates = [];
    let pageNum = 4; // Start from page 4
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
        console.log(`Fetching list page ${pageNum}...`);
        
        await targetPage.goto(`https://www.drphysioclinic.com/latest-updates/${pageNum}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const html = await targetPage.content();

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
            
            await targetPage.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
            const detailHtml = await targetPage.content();
            
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

        pageNum++;
        if (pageNum > 155) break;
        await delay(2000); // 2 second delay between list pages
    }

    browser.disconnect();
    console.log(`Scraped ${allUpdates.length} updates. Data saved to scraped_updates.json`);
}

scrapeViaLocalChrome().catch(console.error);
