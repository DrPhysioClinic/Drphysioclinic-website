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
        console.log("No drphysioclinic tab found. Please open one.");
        browser.disconnect();
        return;
    }

    const result = await targetPage.evaluate(async () => {
        try {
            const res = await fetch('https://www.drphysioclinic.com/latest-updates/4');
            const html = await res.text();
            return {
                status: res.status,
                url: res.url,
                htmlLength: html.length,
                htmlPreview: html.substring(0, 300)
            };
        } catch(e) {
            return { error: e.message };
        }
    });

    console.log(result);
    browser.disconnect();
}

testFetch().catch(console.error);
