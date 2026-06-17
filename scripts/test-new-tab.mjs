import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function testClickAndExtract() {
    console.log("Connecting to local Chrome on port 9222...");
    
    const res = await fetch('http://127.0.0.1:9222/json/version');
    const versionData = await res.json();
    const wsEndpoint = versionData.webSocketDebuggerUrl;
    
    const browser = await puppeteer.connect({ browserWSEndpoint: wsEndpoint, defaultViewport: null });
    
    const pages = await browser.pages();
    let listPage = pages.find(p => p.url().includes('drphysioclinic.com/latest-update'));
    
    if (!listPage) {
        console.log("No drphysioclinic tab found.");
        browser.disconnect();
        return;
    }

    console.log(`Using active tab: ${listPage.url()}`);

    // Get the first update link
    const firstUpdateLink = await listPage.evaluate(() => {
        const a = document.querySelector('.updateContainer a.view-update-details');
        return a ? a.href : null;
    });

    if (!firstUpdateLink) {
        console.log("No update links found on this page!");
        browser.disconnect();
        return;
    }

    console.log(`Found update link: ${firstUpdateLink}`);
    console.log("Opening in a new tab to bypass WAF...");

    const detailPage = await browser.newPage();
    try {
        await detailPage.goto(firstUpdateLink, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const html = await detailPage.content();
        
        if (html.includes('SafeLine WAF')) {
            console.error("WAF blocked us on the new tab!");
        } else {
            const $ = cheerio.load(html);
            const title = $('.updateText').text().trim() || "No Title Found";
            console.log(`SUCCESS! Extracted title: ${title}`);
        }
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await detailPage.close();
        browser.disconnect();
    }
}

testClickAndExtract().catch(console.error);
