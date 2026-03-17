import puppeteer from 'puppeteer-core';

(async () => {
    try {
        const browser = await puppeteer.launch({
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            headless: true
        });
        console.log("Browser launched");
        const page = await browser.newPage();
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
        await page.goto('http://127.0.0.1:5173/products', { waitUntil: 'networkidle0' });
        await browser.close();
    } catch (e) { console.error('PUPPETEER ERROR:', e) }
})();
