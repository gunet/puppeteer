# puppeteer
A GUNet puppeteer Docker image

**Important**: This is a work in progress

# References
* Puppeteer [documentation](https://pptr.dev/guides/docker)
* Reference [Dockerfile](https://github.com/puppeteer/puppeteer/blob/main/docker/Dockerfile)

# Documentation
## Main Library
* File: `gunet.js`
* Usually common code:
```
const puppeteer = require('puppeteer');
const gunet = require('./gunet.js');
const url = process.argv.slice(2);
console.log(url[0]);

(async () => {
    const browser = await puppeteer.launch(gunet.browserOptions());
    const page = await gunet.newPage(browser);
    await page.goto(url[0]);
    await page.waitForTimeout(1000)
    -- Do staff --
    await browser.close();
})();
```
### Funcions
* `click`
  - Click a button
  - Example: `await cas.click(page, "#login")`
* `assertVisibility`
  - Check that an element is actually visible
  - Example: `await cas.assertVisibility(page, '#token')`
* `assertInnerText`
  - Check that a certain text is present
  - Example: `await gunet.assertInnerText(page, '#content div h2', "Επιτυχής Σύνδεση");`
* `type`
  - Type value in text field
  - Example: `await gunet.type(page, "#token",'999666');`
#### CAS SSO functions
* `loginWith`
  - Login with specific username and password
  - Example: ```await gunet.loginWith(page, `${process.env.CAS_USER}`, `${process.env.CAS_PASSWORD}`);```
* `assertTicketGrantingCookie`
  - Check that we received a TickerGrantingCookie (TGT)
  - Example: `await gunet.assertTicketGrantingCookie(page);`

## Usage
* Environment variables
  - `CAS_USER`: Username (default `gunetdemo`)
  - `CAS_PASSWORD`: Password (default `gunetdemo`)
* Show module version: `docker run --rm ghcr.io/gunet/puppeteer npm list`
* General Run: `docker run -it --cap-add=SYS_ADMIN --rm ghcr.io/gunet/puppeteer node --unhandled-rejections=strict <scenario + args>`
* Specific scenarios:
  - `cas`: `./login.js <SSO BASE URL>`
* Arguments
  - `<SSO BASE URL>`: An example might be `https://sso.uoi.gr` or `https://worker-01.dev.gunet.gr:8443/cas` (in the case of `simple-cas`)

# Size
* Disk size: `1.17 GB`