# puppeteer
A GUNet puppeteer Docker image

**Important**: This is a work in progress

# References
* Puppeteer [Documentation](https://pptr.dev/category/guides)
* Puppeteer Docker [documentation](https://pptr.dev/guides/docker)
* Reference [Dockerfile](https://github.com/puppeteer/puppeteer/blob/main/docker/Dockerfile)


# Documentation
## Selectors
* [Reference](https://www.w3schools.com/cssref/css_selectors.php)
* `#id`: Selects the element with id=`"<id>"`
* `div p`: Selects all `<p>` elements inside `<div>` elements
* **Easy** way to find the selector: Inspect an element (in firefox), right click and select `Copy->CSS Selector`

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
  - Arguments
    - `page` element
    - `selector`
  - Example: `await cas.click(page, "#login")`
* `assertVisibility`
  - Check that an element is actually visible
  - Arguments
    - `page` element
    - `selector`
  - Example: `await cas.assertVisibility(page, '#token')`
* `assertInnerText`
  - Check that a certain text is present (with **equality** check)
  - Arguments
    - `page` element
    - `selector`
    - `value` to search for
  - Example: `await gunet.assertInnerText(page, '#content div h2', "Επιτυχής Σύνδεση");`
* `assertInnerTextContains`
  - Check that a certain text is present in the selector
  - Arguments
    - `page` element
    - `selector`
    - `value` to search for
* `assertTextInSource`
  - Check that a certain text is present in page source (for instance when handling text/json/xml pages)
  - Arguments
    - `page`
    - `value` to search for
  - Example: `await gunet.assertTextInSource(page,'OAuth2Token');`
* `assertPageTitle`
  - Check the page title
  - Arguments
    - `page` element
    - `value` to search for
  - Example: `await gunet.assertPageTitle(page, 'SimpleSAMLphp installation page');`
* `type`
  - Type value in text field
  - Arguments
    - `page` element
    - `selector`
    - `value` typed
  - Example: `await gunet.type(page, "#token",'999666');`
* `submitForm`
  - Submit Form
  - Arguments
    - `page` element
    - `selector`
#### CAS SSO functions
* `loginWith`
  - Login with specific username and password
  - Arguments
    - `page` element
    - `user`
    - `password`
  - Example: ```await gunet.loginWith(page, `${process.env.CAS_USER}`, `${process.env.CAS_PASSWORD}`);```
* `assertTicketGrantingCookie`
  - Check that we received a TickerGrantingCookie (TGT). **Only** in the CAS login page, **not** in applications
  - Argument: `page` element
  - Example: `await gunet.assertTicketGrantingCookie(page);`
* `casLogin`
  - Perform all necessary elements of checking for successful SSO login utilizing a provided web page element.
  - Arguments:
    * `page` element
    * `user` to use
    * `password` to use
    * `cas_type` to use. Can be one of `simple-cas` for typical CAS (default) or `gunet-cas` (for GUNet CAS)
    * `cas_lang` to use. Can be one of `en` (default) or `el`
  - Example: ```await gunet.casLogin(page, `${process.env.CAS_USER}`,`${process.env.CAS_PASSWORD}`,`${process.env.CAS_LANG}`);```

## Usage
* Build: `docker compose -f docker-compose.build.yaml build`
### Customization
* If you just want to use `docker run` you can volume mount the `scenarios` folder as `-v <your scenarios folder>:/home/puppeteer/scenarios`
  - Your JS script will have to include a `const gunet = require('../gunet.js');` in order to use the GUNet libraries
* You can also extend the base image as (your scenarios are assumed to be in the folder `scenarios`):
```
FROM gunet/puppeteer:latest

COPY scenarios/ ${PUPPETEER_ROOT}/scenarios/
```
### General usage
* Environment variables
  - `CAS_USER`: Username (default `gunetdemo`)
  - `CAS_PASSWORD`: Password (default `gunetdemo`)
  - `CAS_LANG`: The language to assume in the CAS login page. Can be `en` (default) or `el`
  - `CAS_TYPE`: The CAS type. Can be one of `simple-cas` for typical CAS (default) or `gunet-cas` (for GUNet CAS)
* Show module version: `docker run --rm ghcr.io/gunet/puppeteer npm list`
* General Run: `docker run -it --cap-add=SYS_ADMIN --rm ghcr.io/gunet/puppeteer node --unhandled-rejections=strict <scenario + args>`
* Specific scenarios:
  - `cas`: `./login.js <SSO BASE URL>`
* Arguments
  - `<SSO BASE URL>`: An example might be `https://sso.uoi.gr` or `https://worker-01.dev.gunet.gr:8443/cas` (in the case of `simple-cas`)
* Automatic testig with docker compose stack: `docker compose -f <your docker compose stack yaml file> up --exit-code-from <puppeteer service> --attach <puppeteer service`
  - This will attach only on the puppeteer service output and return the container exit code as the exit code for the whole stack.
  - The puppeteer service image might include a script that runs scenarios and returns `exit 1` if one of them fails or `exit 0` if all return correctly.

# Size
* Disk size: `1.17 GB`