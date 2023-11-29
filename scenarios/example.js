// Example script showing a few useful functions and their usage
const puppeteer = require('puppeteer');
const gunet = require('../../gunet.js');
const url = process.argv.slice(2);
console.log(url[0]);

(async () => {
    const browser = await puppeteer.launch(gunet.browserOptions());
    const page = await gunet.newPage(browser);
    await page.goto(url[0]);
    await gunet.waitForVisible(page, '.btn')
    await gunet.assertPageTitle(page, 'uGuest Services - gunet');
    await gunet.assertInnerText(page, '.btn', 'Σύνδεση Χρήστη');
    await gunet.click(page, '.btn');
    console.log('before SSO')
    await gunet.loginWith(page, process.env.CAS_USER, process.env.CAS_PASSWORD);
    await gunet.waitForVisible(page, '.btn')
    console.log('uGuest main page')
    await gunet.assertInnerTextContains(page, '.well-message > p:nth-child(1) > span:nth-child(2)', 'Ενεργοί λογαριασμοί επισκεπτών');
    await gunet.assertVisibility(page, '.btn > span:nth-child(1)');
    await gunet.click(page, '.btn');
    await gunet.waitForVisible(page, '.btn')
    console.log('Create account page')
    await gunet.assertInnerText(page, '.title','Δημιουργία λογαριασμού επισκέπτη');
    await gunet.click(page, '.btn');
    await gunet.waitForVisible(page, '.info')
    await gunet.assertInnerText(page, '.info','Επιτυχία: Ο λογαριασμός δημιουργήθηκε');
    await browser.close();
    console.log('Account created successfully')
})();