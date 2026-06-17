process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { gotScraping } from 'got-scraping';
import { HttpsProxyAgent } from 'hpagent';
import * as cheerio from 'cheerio';
import fs from 'fs';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

const proxyList = fs.readFileSync('proxies.txt', 'utf8').split('\n').filter(Boolean);

async function fetchHtmlWithProxy(url) {
    for (const proxy of proxyList) {
        try {
            console.log(`Trying proxy ${proxy}...`);
            const res = await gotScraping({
                url,
                https: { rejectUnauthorized: false },
                agent: {
                    https: new HttpsProxyAgent({
                        keepAlive: true,
                        keepAliveMsecs: 1000,
                        maxSockets: 256,
                        maxFreeSockets: 256,
                        proxy: `http://${proxy}`
                    })
                },
                timeout: { request: 5000 }
            });

            if (res.body.includes('SafeLine WAF') || res.body.includes('slg-warning')) {
                console.log(`Proxy ${proxy} blocked by WAF.`);
                continue;
            }

            return res.body;
        } catch (e) {
            console.log(`Proxy ${proxy} failed: ${e.message}`);
        }
    }
    throw new Error('All proxies failed or blocked');
}

async function scrape() {
    let allUpdates = [];
    let page = 1; 
    let hasMore = true;

    let existingUrls = new Set();
    if (fs.existsSync('scraped_updates.json')) {
        const existing = JSON.parse(fs.readFileSync('scraped_updates.json', 'utf8'));
        existing.forEach(u => existingUrls.add(u.url));
        allUpdates = existing;
        console.log(`Loaded ${allUpdates.length} existing updates`);
    }

    while (hasMore) {
        console.log(`Fetching list page ${page}...`);
        
        let html;
        try {
            html = await fetchHtmlWithProxy(`https://www.drphysioclinic.com/latest-updates/${page}`);
        } catch (e) {
            console.error(`Error fetching list page ${page}:`, e.message);
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
            console.log(`Fetching detail page: ${item.url}`);
            let detailHtml;
            try {
                detailHtml = await fetchHtmlWithProxy(item.url);
            } catch (e) {
                console.error(`Error fetching detail page ${item.url}:`, e.message);
                continue;
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
    }

    console.log(`Scraped ${allUpdates.length} updates total. Data saved to scraped_updates.json`);
}

scrape().catch(console.error);
