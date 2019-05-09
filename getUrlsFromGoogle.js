const puppeteer = require('puppeteer');
const fs = require ('fs');

const create_puppeteer = async config => {
    return (await puppeteer.launch(config));
};

const scrape_pages = async data => {
    let morePages = true;
    let dd = {};
    let search = `https://www.google.com/search?q=site:${process.env.site}`;
    await global.page.goto(search, {'waitUntil': 'networkidle0',timeout: 0});
    console.log('loaded page');
    while(morePages) {
        res = await global.page.evaluate(() => Array.from(document.querySelectorAll('a[href][ping]')).map(e=>e.href).filter(e=>!e.includes('google.com')&&!e.includes('webcache')));

        for (let i=0;i<res.length;i++) {
            let element = res[i];
            let hdrs = await global.page1.goto(element, {'waitUntil': 'networkidle0',timeout: 0});
            let status = hdrs.status();
            console.log(`${status} - ${element}`);

            if (!dd.hasOwnProperty(status)) {
                dd[status] = [];
            }

            dd[status].push(element);

            if ([200].includes(status)) {
                let fn = element.replace(/[^\w]/gim,'-').replace(/-+/gim, '-');
                await global.page1.screenshot({path: `ss/${fn}.png`});
            }
        }

        try {
            await Promise.all([
                global.page.$eval('a#pnnext.pn', elem => elem.click()),
                global.page.waitForNavigation({ waitUntil: 'networkidle0' }),
            ]);
        } catch (e)  {
            console.log(e);
            morePages = false;
        }
    }

    return dd;
};

const save_data = async data => {
    console.log('Saving Output');
    let jsonFile = 'full-output.json';
    fs.writeFileSync(jsonFile, JSON.stringify(data));

    let jsonFile1 = '404-output.json';
    fs.writeFileSync(jsonFile1, JSON.stringify(data['404']));

    return data;
}

const end  = async () => {
    console.log('Process Finished');
    global.browser.close();
    process.exit();
}

const create_enviroment = async browser => {
    global.browser = browser;
    global.page = await global.browser.newPage();
    global.page1 = await global.browser.newPage();

    const ua = '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36';
    await global.page.setUserAgent(ua);
    await global.page1.setUserAgent(ua);
};



if (process.env.site === void 0) {
    console.log('Please specify a site in an enviroment variable e.g "site=\'onlinepoolchemicals.com\' node getUrlsFromGoogle.js"');
    process.exit(1);
}


const puppeter_opts = {
    headless: true
};
create_puppeteer(puppeter_opts)
    .then(create_enviroment)
    .then(scrape_pages)
    .then(save_data)
    .then(end)
    .catch(err => {
        console.log(`Error: ${err}`);
        global.browser.close();
        process.exit();
    });

    