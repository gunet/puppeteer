const puppeteer = require('puppeteer');
const gunet = require('./gunet.js');
const url = process.argv.slice(2);
console.log(url[0]);

(async () => {
    const browser = await puppeteer.launch(gunet.browserOptions());
    const page = await gunet.newPage(browser);
    await page.goto(url[0]);
    await page.waitForTimeout(1000)
    await gunet.loginWith(page, `${process.env.CAS_USER}`, `${process.env.CAS_PASSWORD}`);
    await gunet.assertTicketGrantingCookie(page);
    await page.waitForTimeout(2000)
    await gunet.assertInnerText(page, '#content div h2', "Επιτυχής Σύνδεση");
    await browser.close();
})();
