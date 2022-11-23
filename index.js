require("dotenv").config();

const axios = require("axios");
const puppeteer = require("puppeteer");

(async () => {
  let pageurl = "https://netlify-forms-submission.netlify.app/";

  // Navigate the the Page URL
  let browser = await puppeteer.launch({ headless: true });
  let page = await browser.newPage();
  await page.goto(pageurl);

  await page.type("[name=firstName]", "Taimoor");
  await page.type("[name=lastName]", "Sattar");
  await page.type("[name=email]", "example@taimoorsattar.com");
  await page.type("[name=url]", "https://taimoorsattar.com");
  await page.type("[name=message]", "Hi there");
  await page.type("[name=positions]", "frontEnd");

  const googlekey = await page.$eval(
    ".g-recaptcha",
    (el) => el.dataset.sitekey
  );

  let captchaSolver = await axios.get(
    `http://2captcha.com/in.php?key=${process.env.key}&method=userrecaptcha&pageurl=${pageurl}&googlekey=${googlekey}&json=1`
  );

  // Wait for some time
  await page.waitForTimeout(1000);

  const TOKEN = await new Promise((resolve, reject) => {
    let intervalID = setInterval(async () => {
      let captchaResult = await axios.get(
        `http://2captcha.com/res.php?key=${process.env.key}&action=get&id=${captchaSolver?.data?.request}&json=1`
      );
      console.log(captchaResult?.data);

      if (captchaResult?.data?.status == 1) {
        clearInterval(intervalID);
        resolve(captchaResult?.data?.request);
      }
    }, 8300);
  });

  let siteToken = await page.evaluate((TOKEN) => {
    let result = (document.getElementById("g-recaptcha-response").innerHTML =
      TOKEN);
    let exp = document.getElementById("g-recaptcha-response").innerHTML;

    return exp;
  }, TOKEN);

  await page.screenshot({
    type: "jpeg",
    path: "buddy-screenshot.png",
    fullPage: true,
  });

  await page.click("[type=submit]");

  await browser.close();
})();
