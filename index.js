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
  await page.goto(url);
  console.log("Loaded restaurant reservation page");
  browser.close();

  await page.waitForSelector()
}

start();
