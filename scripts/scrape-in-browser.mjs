import puppeteer from 'puppeteer';
import fs from 'fs';

async function scrapeInBrowser() {
    const res = await fetch('http://127.0.0.1:9222/json/version');
    const versionData = await res.json();
    const wsEndpoint = versionData.webSocketDebuggerUrl;
    
    const browser = await puppeteer.connect({ browserWSEndpoint: wsEndpoint, defaultViewport: null });
    
    const pages = await browser.pages();
    let targetPage = pages.find(p => p.url().includes('drphysioclinic.com/latest-updates'));
    
    if (!targetPage) {
        console.log("No drphysioclinic tab found. Please open one.");
        browser.disconnect();
        return;
    }

    let existingUrls = [];
    if (fs.existsSync('scraped_updates.json')) {
        const existing = JSON.parse(fs.readFileSync('scraped_updates.json', 'utf8'));
        existingUrls = existing.map(u => u.url);
        console.log(`Loaded ${existingUrls.length} existing updates to skip.`);
    }

    console.log("Injecting scraping logic into the browser tab...");
    
    const result = await targetPage.evaluate(async (existingUrls) => {
        const logs = [];
        const log = (msg) => logs.push(msg);
        
        try {
            const delay = (ms) => new Promise(res => setTimeout(res, ms));
            const allUpdates = [];
            let hasMore = true;
            let pageNum = 4;
            const existingSet = new Set(existingUrls);

            while (hasMore) {
                log(`Fetching list page ${pageNum}...`);
                const res = await fetch(`https://www.drphysioclinic.com/latest-updates/${pageNum}`);
                const html = await res.text();

                if (html.includes('SafeLine WAF')) {
                    log("WAF blocked us on list page!");
                    return { updates: allUpdates, logs };
                }

                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                const updateElements = doc.querySelectorAll('.updateContainer');
                if (updateElements.length === 0) {
                    log(`No more updates on list page ${pageNum}. Finished.`);
                    break;
                }

                const pageUrls = [];
                updateElements.forEach(el => {
                    const a = el.querySelector('a.view-update-details');
                    const titleEl = el.querySelector('.updateText');
                    if (a && titleEl) {
                        const url = a.href; 
                        const title = titleEl.textContent.trim();
                        if (!existingSet.has(url)) {
                            pageUrls.push({ url, title });
                            existingSet.add(url);
                        }
                    }
                });

                log(`Found ${pageUrls.length} new urls on page ${pageNum}`);

                for (const item of pageUrls) {
                    await delay(1000);
                    log(`Fetching detail page: ${item.url}`);
                    const detailRes = await fetch(item.url);
                    const detailHtml = await detailRes.text();

                    if (detailHtml.includes('SafeLine WAF')) {
                        log("WAF blocked us on detail page!");
                        return { updates: allUpdates, logs };
                    }

                    const dDoc = parser.parseFromString(detailHtml, 'text/html');
                    
                    let contentHtml = '';
                    let excerpt = '';
                    
                    const updateContent = dDoc.querySelector('.updateContent');
                    if (updateContent) {
                        contentHtml = updateContent.innerHTML;
                        excerpt = updateContent.textContent.trim().substring(0, 150);
                    } else {
                        const p = dDoc.querySelector('.col-md-12 p');
                        if (p && p.parentElement) {
                            contentHtml = p.parentElement.innerHTML;
                            excerpt = p.textContent.trim().substring(0, 150);
                        } else {
                            const container = dDoc.querySelector('.container');
                            if (container) contentHtml = container.innerHTML;
                        }
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

                pageNum++;
                if (pageNum > 155) break;
                await delay(1500);
            }
            return { updates: allUpdates, logs };
        } catch (e) {
            log(`ERROR: ${e.message}`);
            return { updates: [], logs };
        }
    }, existingUrls);

    console.log("Logs from browser:");
    console.log(result.logs.join('\n'));

    const newUpdates = result.updates;
    console.log(`Scraped ${newUpdates.length} NEW updates from the browser.`);
    
    if (newUpdates.length > 0) {
        let allUpdates = [];
        if (fs.existsSync('scraped_updates.json')) {
            allUpdates = JSON.parse(fs.readFileSync('scraped_updates.json', 'utf8'));
        }
        allUpdates = allUpdates.concat(newUpdates);
        fs.writeFileSync('scraped_updates.json', JSON.stringify(allUpdates, null, 2));
        console.log(`Total saved updates: ${allUpdates.length}`);
    }

    browser.disconnect();
}

scrapeInBrowser().catch(console.error);
