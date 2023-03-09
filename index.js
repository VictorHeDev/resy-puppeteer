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
  var startTime = performance.now();
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

  // Measures login time
  var endTime = performance.now();
  console.log(`Login Performance: ${endTime - startTime}ms`);

  // Find and click on the desired reservation time
  const desired_res = "text/" + settings.time;
  var startResTime = performance.now();

  // Try for Desired Reservation Time
  try {
    await page.waitForTimeout(1000);
    await page.click(desired_res);
    console.log("Desired reservation is available");
    const popup = await page.waitForSelector("iframe[role=dialog]");
    const frame = await popup.contentFrame();
    // await frame.waitForTimeout(1250);
    // await frame.click("button[data-test-id=order_summary_page-button-book]");
    // console.log("Clicked Reserve Now!");
    // await frame.click("button[data-test-id=order_summary_page-button-book]");
    // console.log("Confirmed reservation!");
    const confirmation = await frame.waitForSelector(
      "text/Reservation Booked."
    );

    if (confirmation) {
      console.log("Reservation Confirmed!");
    } else {
      console.log("Unable to confirm reservation.");
    }

    var endResTime = performance.now();
    console.log(`Reservation Performance: ${endResTime - startResTime}ms`);
    await browser.close();
  } catch {
    // Try for Alternate Reservation Times
    console.log(
      "Desired Reservation unavailable - attempting to find next available reservation"
    );

    for (let i = 0; i < reservation_times.length; i++) {
      const next_res = "text/" + reservation_times[i] + settings.type;
      try {
        await page.click(next_res);
        console.log("Next available reservation is at " + reservation_times[i]);
        const popup = await page.waitForSelector("iframe[role=dialog]");
        const frame = await popup.contentFrame();
        // await frame.waitForTimeout(1250);
        // await frame.click("button[data-test-id=order_summary_page-button-book]");
        // console.log("Clicked Reserve Now!");
        // await frame.click("button[data-test-id=order_summary_page-button-book]");
        // console.log("Confirmed reservation!");
        const confirmation = await frame.waitForSelector(
          "text/Reservation Booked."
        );
        if (confirmation) {
          console.log("Reservation Confirmed!");
        } else {
          console.log("Unable to confirm reservation.");
        }
        var endResTime = performance.now();
        console.log(`Reservation Performance: ${endResTime - startResTime}ms`);
        await browser.close();
        break;
      } catch {
        console.log("No available reservation at " + reservation_times[i]);
      }
    }
  }
  console.log(
    "No reservations near the specified time are available - shutting off the script"
  );
}

start();
