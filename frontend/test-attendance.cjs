const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
    await page.goto('http://localhost:5174/login');
    // We can't log in easily without credentials... but maybe we can just hit /attendance and see if it fails to mount at all when bypassed?
    // Actually, localStorage can be mocked.
    await page.evaluate(() => {
        localStorage.setItem('userRole', 'lecturer');
        localStorage.setItem('token', 'fake-token');
    });
    await page.goto('http://localhost:5174/attendance');
    await page.waitForTimeout(2000);
    await browser.close();
})();
