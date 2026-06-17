import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function extractAndSave() {
    const res = await fetch('http://127.0.0.1:9222/json/version');
    const versionData = await res.json();
    const wsEndpoint = versionData.webSocketDebuggerUrl;
    
    const browser = await puppeteer.connect({ browserWSEndpoint: wsEndpoint, defaultViewport: null });
    
    const pages = await browser.pages();
    let targetPage = pages.find(p => p.url().includes('drphysioclinic.com/latest-updates'));
    
    if (!targetPage) {
        console.log("No drphysioclinic tab found.");
        browser.disconnect();
        return;
    }

    const html = await targetPage.content();
    const $ = cheerio.load(html);
    
    const pageUrls = [];
    $('.updateContainer').each((i, el) => {
        const url = $(el).find('a.view-update-details').attr('href');
        const title = $(el).find('.updateText').text().trim();
        if (url) pageUrls.push({ url, title });
    });

    console.log(`Found ${pageUrls.length} urls on current page.`);

    let allUpdates = [];
    if (fs.existsSync('scraped_updates.json')) {
        allUpdates = JSON.parse(fs.readFileSync('scraped_updates.json', 'utf8'));
    }
    const existingSet = new Set(allUpdates.map(u => u.url));

    const newUpdates = [];
    for (const item of pageUrls) {
        if (!existingSet.has(item.url)) {
            // Need to fetch detail page! 
            // Wait, we can't fetch detail page because WAF blocks it!
            // But we can just use the excerpt and content from the list page? 
            // No, the list page only has title and image.
        }
    }
    
    browser.disconnect();
}
extractAndSave().catch(console.error);
