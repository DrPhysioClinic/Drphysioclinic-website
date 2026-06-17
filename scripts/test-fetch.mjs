import puppeteer from 'puppeteer';
import fs from 'fs';

async function testFetch() {
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

    const html = await targetPage.evaluate(async () => {
        const response = await fetch('https://www.drphysioclinic.com/latest-updates/6');
        return await response.text();
    });

    console.log(`Fetched page 6 via evaluate! Length: ${html.length}`);
    if (html.includes('SafeLine WAF')) {
        console.log("SafeLine WAF blocked the fetch inside the browser.");
    } else {
        console.log("Success! No WAF block.");
    }
    
    browser.disconnect();
}

testFetch().catch(console.error);
