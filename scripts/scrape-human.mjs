import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import fs from 'fs';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function scrapeLikeHuman() {
    console.log("Connecting to local Chrome on port 9222...");
    
    const res = await fetch('http://127.0.0.1:9222/json/version');
    const versionData = await res.json();
    const wsEndpoint = versionData.webSocketDebuggerUrl;
    
    const browser = await puppeteer.connect({ browserWSEndpoint: wsEndpoint, defaultViewport: null });
    
    const pages = await browser.pages();
    let listPage = pages.find(p => p.url().includes('drphysioclinic.com/latest-update'));
    
    if (!listPage) {
        console.log("No drphysioclinic tab found. Please keep it open on the list page.");
        browser.disconnect();
        return;
    }

    await listPage.bringToFront();
    
    let allUpdates = [];
    if (fs.existsSync('scraped_updates.json')) {
        const existing = JSON.parse(fs.readFileSync('scraped_updates.json', 'utf8'));
        allUpdates = existing;
    }
    const existingSet = new Set(allUpdates.map(u => u.url));
    console.log(`Loaded ${existingSet.size} existing updates`);

    let hasMore = true;

    while (hasMore) {
        const currentUrl = listPage.url();
        const urlMatch = currentUrl.match(/\/latest-updates\/(\d+)/);
        let currentPageNum = urlMatch ? parseInt(urlMatch[1]) : 1;
        console.log(`Processing list page ${currentPageNum}...`);

        const html = await listPage.content();
        const $ = cheerio.load(html);
        
        const pageUrls = [];
        $('.updateContainer').each((i, el) => {
            const url = $(el).find('a.view-update-details').attr('href');
            const title = $(el).find('.updateText').text().trim();
            if (url) pageUrls.push({ url, title });
        });

        if (pageUrls.length === 0) {
            console.log("No update links found on this list page. Finishing.");
            break;
        }

        for (const item of pageUrls) {
            if (existingSet.has(item.url)) {
                continue;
            }

            console.log(`Extracting: ${item.title}`);
            
            const detailPage = await browser.newPage();
            try {
                await detailPage.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                const detailHtml = await detailPage.content();
                
                if (detailHtml.includes('SafeLine WAF') || detailHtml.includes('slg-warning')) {
                    console.error("WAF blocked us on the new tab!");
                    await detailPage.close();
                    browser.disconnect();
                    return;
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
                
                existingSet.add(item.url);
                fs.writeFileSync('scraped_updates.json', JSON.stringify(allUpdates, null, 2));

            } catch (e) {
                console.error("Error fetching detail:", e.message);
            } finally {
                await detailPage.close();
            }
            
            await delay(1500); 
        }

        // FIND NEXT BUTTON
        const nextTargetNum = currentPageNum + 1;
        console.log(`Looking for link to page ${nextTargetNum}...`);
        
        const clickedNext = await listPage.evaluate((nextNum) => {
            const links = Array.from(document.querySelectorAll('a'));
            const nextLink = links.find(a => a.href && (a.href.includes(`/latest-updates/${nextNum}`) || a.href.includes(`?page=${nextNum}`)));
            if (nextLink) {
                nextLink.click();
                return true;
            }
            return false;
        }, nextTargetNum);

        if (clickedNext) {
            console.log(`Clicked next to go to page ${nextTargetNum}. Waiting for navigation...`);
            try {
                await listPage.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 });
                const newHtml = await listPage.content();
                if (newHtml.includes('SafeLine WAF')) {
                    console.error("WAF blocked us after clicking Next on list page!");
                    break;
                }
                await delay(2000); 
            } catch (e) {
                console.error("Navigation timeout or error:", e.message);
                break;
            }
        } else {
            console.log(`No pagination link found for page ${nextTargetNum}. Finishing.`);
            hasMore = false;
        }
    }

    browser.disconnect();
    console.log(`Finished scraping. Total updates now: ${allUpdates.length}`);
}

scrapeLikeHuman().catch(console.error);
