import puppeteer from 'puppeteer';

async function testClickNext() {
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

    // Try to find the Next button and click it
    console.log("Looking for Next button...");
    
    const nextUrl = await listPage.evaluate(() => {
        const links = Array.from(document.querySelectorAll('.pagination a'));
        const nextLink = links.find(a => a.textContent.trim() === '»');
        if (nextLink) {
            nextLink.click();
            return nextLink.href;
        }
        return null;
    });

    if (nextUrl) {
        console.log(`Clicked Next button! Expected next URL: ${nextUrl}`);
        // Wait for navigation
        await listPage.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 });
        const newUrl = listPage.url();
        console.log(`Navigated to: ${newUrl}`);
        
        const html = await listPage.content();
        if (html.includes('SafeLine WAF')) {
            console.error("WAF blocked us after clicking Next!");
        } else {
            console.log("Success! Page loaded correctly.");
        }
    } else {
        console.log("No Next button found.");
    }

    browser.disconnect();
}

testClickNext().catch(console.error);
