const puppeteer = require("puppeteer");
const functions = require("./functions");
const fs = require("fs");
const settings = JSON.parse(fs.readFileSync("./settings/settings.json"));
const login = JSON.parse(fs.readFileSync("./settings/login.json"));

const url =
  settings.site +
  settings.city +
  functions.url_prep(settings.restaurant) +
  settings.date +
  settings.seats;

const reservation_times = functions.relevantTimes(settings.time);

async function start() {
  console.log("Starting Puppeteer Script");

  // Puppeteer Settings
  const browser = await puppeteer.launch({
    headless: false,
    ignoreHTTPSErrors: true,
    args: ["--start-maximized"],
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  });
  const page = await browser.newPage();

  // Load Resy URL
  await page.goto(url);
  console.log("Loaded restaurant reservation page");

  // Login to Resy
  await page.click("text/Log in");
  await page.click("text/Use Email and Password instead");
  await page.type("input[name=email]", login.email);
  await page.type("input[name=password]", login.password);
  await page.click("text/Continue");

  // Find and click on the desired reservation time
  const desired_res = "text/" + settings.time + settings.type;
  await page.waitForTimeout(1000);
  try {
    await page.click(desired_res);
    await page.waitForTimeout(1500);
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("Tab");
    }
    // await page.keyboard.press("Enter");
  } catch {
    console.log(
      "Desired Reservation unavailable - attempting to find next available reservation"
    );

    for (let i = 0; i < reservation_times.length; i++) {
      const next_res = "text/" + reservation_times[i] + settings.type;
      try {
        await page.click(next_res);
        console.log("Next available reservation is at " + reservation_times[i]);
        await page.waitForTimeout(1500);
        for (let i = 0; i < 6; i++) {
          await page.keyboard.press("Tab");
        }
        // await page.keyboard.press("Enter");
        break;
      } catch {
        console.log("No available reservation at " + reservation_times[i]);
      }
    }
  }

  // await page.waitForSelector("text/Reserve Now");
}

start();
