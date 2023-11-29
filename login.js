const puppeteer = require('puppeteer');
const gunet = require('./gunet.js');
const url = process.argv.slice(2);
console.log(url[0]);

(async () => {
    const browser = await puppeteer.launch(gunet.browserOptions());
    const page = await gunet.newPage(browser);
    await page.goto(url);
    await gunet.casLogin(page, process.env.CAS_USER,
    process.env.CAS_PASSWORD, process.env.CAS_TYPE,
    process.env.CAS_LANG);
    await browser.close();
})();
