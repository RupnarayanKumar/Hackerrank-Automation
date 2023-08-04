// npm init -y
// npm install minimist
// npm install puppeteer -g       // globally installed

// Terminal : node 1HackerrankAutomation.js --source=https://www.hackerrank.com --config=config.json

let minimist = require("minimist");
let fs = require("fs");

let args = minimist(process.argv);
let configJSON = fs.readFileSync(args.config, "utf-8");
let config = JSON.parse(configJSON);

let puppeteer = require("puppeteer");

async function run(){
    let browser = await puppeteer.launch({
        headless: false,
        args: ['--start-maximized'],
        defaultViewport: null
    });

    let pages = await browser.pages();
    let page = pages[0];
    // await page.setViewport({width: 1366, height: 768})
    
    // open the url
    await page.goto(args.source);

    // wait and then click on login on page1
    await page.waitForSelector("a[href='/access-account/']");
    await page.click("a[href='/access-account/']");
    
    // wait and then click on login on page2
    await page.waitForSelector("a.hr_button[href='/login/']");
    await page.click("a.hr_button[href='/login/']");
    
    // type username
    await page.waitForSelector("input[name='username']");
    await page.type("input[name='username']", config.userid, {delay: 30});

    // type password
    await page.waitForSelector("input[name='password']");
    await page.type("input[name='password']", config.password, {delay: 30});

    // click login on page 3
    await page.waitForSelector("button[type='submit']");
    await page.click("button[type='submit']");

    // click on contest
    await page.waitForSelector("a[data-analytics='NavBarContests']");
    await page.click("a[data-analytics='NavBarContests']");

    // click on manage contest
    await page.waitForSelector("a[href='/administration/contests/']");
    await page.click("a[href='/administration/contests/']");

    // find number of pages
    // await page.waitForSelector("a[data-attr1='Last']");
    // let numPages = await page.$eval("a[data-attr1='Last']", function(atag){
    //     let totPages = parseInt(atag.getAttribute("data-page"));
    //     return totPages; 
    // });
    let numPages = 1;
    for(let i = 1; i <= numPages; i++){
        await handleAllContestsOfAPage(page, browser);

        if(i < numPages){
            await page.waitForSelector("a[data-attr1='Right']");
            await page.click("a[data-attr1='Right']");
        }
    }

}

async function handleAllContestsOfAPage(page, browser){
     // find all urls of same page
     await page.waitForSelector("a.backbone.block-center");
     let curls = await page.$$eval("a.backbone.block-center", function(atags){   //$$eval run document.queryselectorAll on selector(a.backbone.block-center) and provide array to the fn 1st argument
         let urls = [];
 
         for(let i = 0; i < atags.length; i++){
             let url = atags[i].getAttribute("href");
             urls.push(url);
         }
 
         return urls;
     });
     // console.log(curls);
 
     for(let i = 0; i < curls.length; i++){
         let ctab = await browser.newPage(); 
         await saveModeratorInContest(ctab, args.source + curls[i], config.moderators[0]);    // async fn ko call krte time await lagana hoga
         await ctab.close();
         await page.waitForTimeout(3000);
     }
}

async function saveModeratorInContest(ctab, fullcurl, moderator){
    await ctab.bringToFront();
    await ctab.goto(fullcurl);
    await ctab.waitForTimeout(3000);

    // click on moderators
    await ctab.waitForSelector("li[data-tab='moderators']");
    await ctab.click("li[data-tab='moderators']");

    // type in moderator input
    await ctab.waitForSelector("input#moderator");
    await ctab.type("input#moderator", moderator, {delay: 30});

    // press enter after
    await ctab.keyboard.press("Enter");
}

run();