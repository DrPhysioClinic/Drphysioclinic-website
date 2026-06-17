import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function extractCurrentTab() {
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
    console.log("Extracted HTML from user's active tab! Length:", html.length);
    fs.writeFileSync('temp_extracted.html', html);
    browser.disconnect();
}

extractCurrentTab().catch(console.error);
