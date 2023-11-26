const assert = require('assert');
const axios = require('axios');
const https = require('https');
const {spawn} = require('child_process');
const waitOn = require('wait-on');
const colors = require('colors');
const fs = require("fs");
const {ImgurClient} = require('imgur');
const path = require("path");

const BROWSER_OPTIONS = {
    ignoreHTTPSErrors: true,
    headless: process.env.HEADLESS === "true",
//    devtools: process.env.CI !== "true",
    defaultViewport: null,
    slowMo: process.env.CI === "true" ? 0 : 10,
    args: ['--start-maximized', "--window-size=1920,1080", '--incognito']
};

exports.browserOptions = () => BROWSER_OPTIONS;
exports.browserOptions = (opt) => {
    return {
        ...BROWSER_OPTIONS,
        ...opt
    };
};

exports.removeDirectory = async (directory) => {
    console.log(colors.green(`Removing directory ${directory}`));
    fs.rmdir(directory, {recursive: true}, () => {
    });
}

exports.click = async (page, button) => {
    await page.evaluate((button) => {
        document.querySelector(button).click();
    }, button);
}

exports.clickLast = async (page, button) => {
    await page.evaluate((button) => {
        let buttons = document.querySelectorAll(button);
        buttons[buttons.length - 1].click();
    }, button);
}

exports.clickNthButton = async (page, button, n) => {
  const buttons = await page.$$(button);
  await buttons[n].click();
}

exports.innerText = async (page, selector) => {
    let text = await page.$eval(selector, el => el.innerText.trim());
    console.log(`Text for selector [${selector}] is: [${text}]`);
    return text;
}

exports.textContent = async (page, selector) => {
    let element = await page.$(selector);
    let text = await page.evaluate(element => element.textContent.trim(), element);
    console.log(`Text content for selector [${selector}] is: [${text}]`);
    return text;
}

exports.inputValue = async (page, selector) => {
    const element = await page.$(selector);
    const text = await page.evaluate(element => element.value, element);
    console.log(`Input value for selector [${selector}] is: [${text}]`);
    return text;
}

exports.uploadImage = async (imagePath) => {
    let clientId = process.env.IMGUR_CLIENT_ID;
    if (clientId !== null && clientId !== undefined) {
        console.log(`Uploading image ${imagePath}`);
        const client = new ImgurClient({clientId: clientId});
        const response = await client.upload(imagePath);
        console.log(colors.green(response.data.link));
    }
}

exports.loginWith = async (page, user, password,
                           usernameField = "#username",
                           passwordField = "#password") => {
    console.log(`Logging in with ${user} and ******`);
    await this.type(page, usernameField, user);
    await this.type(page, passwordField, password);
    await page.keyboard.press('Enter');
    await page.waitForNavigation();
}

exports.fetchGoogleAuthenticatorScratchCode = async (user = "casuser") => {
    console.log(`Fetching Scratch codes for ${user}...`);
    const response = await this.doRequest(`${process.env.CAS_SERVER_NAME}/actuator/gauthCredentialRepository/${user}`,
        "GET", {
            'Accept': 'application/json'
        });
    return JSON.stringify(JSON.parse(response)[0].scratchCodes[0]);
}
exports.isVisible = async (page, selector) => {
    let element = await page.$(selector);
    console.log(`Checking visibility for ${selector}`);
    return (element != null && await element.boundingBox() != null);
}

exports.assertVisibility = async (page, selector) => {
    assert(await this.isVisible(page, selector));
}

exports.assertInvisibility = async (page, selector) => {
    let element = await page.$(selector);
    console.log(`Checking element invisibility for ${selector}`);
    assert(element == null || await element.boundingBox() == null);
}

exports.assertTicketGrantingCookie = async (page) => {
    const tgc = (await page.cookies()).filter(value => {
        console.log(`Checking cookie ${value.name}`)
        return value.name === "TGC"
    });
    assert(tgc.length !== 0);
    console.log(`Asserting ticket-granting cookie: ${tgc[0].value}`);
    return tgc[0];
}

exports.assertNoTicketGrantingCookie = async (page) => {
    let tgc = (await page.cookies()).filter(value => {
        console.log(`Checking cookie ${value.name}`)
        return value.name === "TGC"
    });
    console.log(`Asserting no ticket-granting cookie: ${tgc}`);
    assert(tgc.length === 0);
}

exports.casLogin = async (page, url, user, password, cas_type = "cas") => {
    console.log(`Going to ${url}`);
    await page.goto(url);
    await page.waitForTimeout(1000)
    await this.loginWith(page, user, password);
    await this.assertTicketGrantingCookie(page);
    await page.waitForTimeout(2000)
    if (cas_type === 'cas') {
        await this.assertInnerText(page, '#content div h2', "Log In Successful");
        // await this.assertInnerText(page, '#content div h2', "Επιτυχής Σύνδεση");
    }
    else if (cas_type === 'simple-cas') {
        await this.assertInnerText(page, '#content div h2', "Log In Successful");
    }
}

exports.submitForm = async (page, selector) => {
    console.log(`Submitting form ${selector}`);
    await page.$eval(selector, form => form.submit());
    await page.waitForTimeout(2500)
}

exports.type = async (page, selector, value) => {
    console.log(`Typing in field ${selector}`);
    await page.$eval(selector, el => el.value = '');
    await page.type(selector, value);
}

exports.newPage = async (browser) => {
    console.clear();
    let page = (await browser.pages())[0];
    if (page === undefined) {
        page = await browser.newPage();
    }
    await page.setDefaultNavigationTimeout(0);
    // await page.setRequestInterception(true);
    await page.bringToFront();
    return page;
}

exports.assertParameter = async (page, param) => {
    console.log(`Asserting parameter ${param} in URL: ${page.url()}`);
    let result = new URL(page.url());
    let value = result.searchParams.get(param);
    console.log(`Parameter ${param} with value ${value}`);
    assert(value != null);
    return value;
}

exports.assertMissingParameter = async (page, param) => {
    let result = new URL(page.url());
    assert(result.searchParams.has(param) === false);
}

exports.sleep = async (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

exports.assertTicketParameter = async (page) => {
    console.log(`Page URL: ${page.url()}`);
    let result = new URL(page.url());
    assert(result.searchParams.has("ticket"))
    let ticket = result.searchParams.get("ticket");
    console.log(`Ticket: ${ticket}`);
    assert(ticket != null);
    return ticket;
}

exports.doRequest = async (url, method = "GET", headers = {}, statusCode = 200, requestBody = undefined) => {
    return new Promise((resolve, reject) => {
        let options = {
            method: method,
            rejectUnauthorized: false,
            headers: headers
        };
        console.log(`Contacting ${url} via ${method}`)
        const handler = (res) => {
            console.log(`Response status code: ${res.statusCode}`)
            if (statusCode > 0) {
                assert(res.statusCode === statusCode);
            }
            res.setEncoding("utf8");
            const body = [];
            res.on("data", chunk => body.push(chunk));
            res.on("end", () => resolve(body.join("")));
        };

        if (requestBody !== undefined) {
            let request = https.request(url, options, res => {
                handler(res);
            }).on("error", reject);
            request.write(requestBody);
        } else {
            https.get(url, options, res => {
                handler(res);
            }).on("error", reject);
        }
    });
}

exports.doGet = async (url, successHandler, failureHandler) => {
    const instance = axios.create({
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    });
    await instance
        .get(url)
        .then(res => {
            console.log(res.data);
            successHandler(res);
        })
        .catch(error => {
            failureHandler(error);
        })
}

exports.doPost = async (url, params, headers, successHandler, failureHandler) => {
    const instance = axios.create({
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    });
    let urlParams = params instanceof URLSearchParams ? params : new URLSearchParams(params);
    await instance
        .post(url, urlParams, {headers: headers})
        .then(res => {
            console.log(res.data);
            successHandler(res);
        })
        .catch(error => {
            failureHandler(error);
        })
}

exports.waitFor = async (url, successHandler, failureHandler) => {
    let opts = {
        resources: [url],
        delay: 1000,
        interval: 2000,
        timeout: 120000
    };
    await waitOn(opts)
        .then(function () {
            successHandler("good")
        })
        .catch(function (err) {
            failureHandler(err);
        });
}

exports.assertInnerTextStartsWith = async (page, selector, value) => {
    const header = await this.innerText(page, selector);
    assert(header.startsWith(value));
}

exports.assertInnerTextContains = async (page, selector, value) => {
    const header = await this.innerText(page, selector);
    assert(header.includes(value));
}

exports.assertInnerText = async (page, selector, value) => {
    const header = await this.innerText(page, selector);
    assert(header === value)
}

exports.assertPageTitle = async (page, value) => {
    const title = await page.title();
    console.log(`Page Title: ${title}`);
    assert(title === value)
}

exports.screenshot = async (page) => {
    let index = Math.floor(Math.random() * 10000);
    let filePath = path.join(__dirname, `/screenshot${index}.png`)
    await page.screenshot({path: filePath, fullPage: true});
    console.log(colors.green(`Screenshot saved at ${filePath}`));
    await this.uploadImage(filePath);
}

exports.assertTextContent = async (page, selector, value) => {
    await page.waitForSelector(selector, {visible: true});
    let header = await this.textContent(page, selector);
    assert(header === value);
}

exports.assertTextContentStartsWith = async (page, selector, value) => {
    await page.waitForSelector(selector, {visible: true});
    let header = await this.textContent(page, selector);
    assert(header.startsWith(value));
}

exports.assertTextInSource = async (page, value) => {
    let source = await page.content();
    let position = await source.search(value);
    console.log(`Position for value [${value}]: [${position}]`);
    assert(position != -1);
}