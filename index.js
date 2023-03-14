const cron = require("node-cron");
const express = require("express");
app = express();
const puppeteer = require("puppeteer");
const functions = require("./functions");
const fs = require("fs");
const settings = JSON.parse(fs.readFileSync("./settings/settings.json"));
const login = JSON.parse(fs.readFileSync("./settings/login.json"));
const program = JSON.parse(fs.readFileSync("./settings/program.json"));

const url =
  settings.site +
  settings.city +
  functions.url_prep(settings.restaurant) +
  settings.date +
  settings.seats;

const reservation_times = functions.relevantTimes(
  settings.time,
  settings.range
);

// Login Cron Job Schedule
let loginTime = functions.programTimer(settings.release, program.buffer);
loginTime = loginTime.split(":");
let loginSchedule = [
  loginTime[2],
  loginTime[1],
  loginTime[0],
  program.day,
  program.month,
  program.weekday,
].join(" ");

cron.schedule(loginSchedule, function () {
  loginResy();
});

// Reserve Cron Job Schedule
let reserveTime = functions.programTimer(settings.release, 1);
reserveTime = reserveTime.split(":");
let reserveSchedule = [
  reserveTime[2],
  reserveTime[1],
  reserveTime[0],
  program.day,
  program.month,
  program.weekday,
].join(" ");

cron.schedule(reserveSchedule, function () {
  reserve();
});

// Start Puppeteer
let browser, page;
async function start() {
  browser = await puppeteer.launch({
    headless: false,
    ignoreHTTPSErrors: true,
    args: ["--start-maximized"],
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  });

  page = await browser.newPage();
}

// Log into Resy Function
async function loginResy() {
  console.log("Starting Puppeteer Script");

  // Load Resy URL
  await page.goto(url);
  console.log("Loaded restaurant reservation page");

  // Login to Resy
  await page.click("text/Log in");
  await page.click("text/Use Email and Password instead");
  await page.type("input[name=email]", login.email);
  await page.type("input[name=password]", login.password);
  await page.click("text/Continue");
  console.log("Current time: ", new Date());
}

async function reserve() {
  // Find and click on the desired reservation time
  const desired_res = "text/" + settings.time;
  var startResTime = performance.now();

  // Try for Desired Reservation Time
  page.reload();
  try {
    await page.waitForTimeout(1000);
    await page.click(desired_res);
    console.log("Desired reservation is available");
    const popup = await page.waitForSelector("iframe[role=dialog]");
    const frame = await popup.contentFrame();
    await frame.waitForTimeout(1250);
    await frame.click("button[data-test-id=order_summary_page-button-book]");
    console.log("Clicked Reserve Now!");
    await frame.click("button[data-test-id=order_summary_page-button-book]");
    console.log("Confirmed reservation!");
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
    return;
  } catch {
    // Try for Alternate Reservation Times
    console.log(
      "Desired Reservation unavailable - attempting to find next available reservation"
    );

    for (let i = 0; i < reservation_times.length; i++) {
      const next_res = "text/" + reservation_times[i] + settings.type;
      try {
        await page.click(next_res);
        console.log("An alternative reservation is available");
        const popup = await page.waitForSelector("iframe[role=dialog]");
        const frame = await popup.contentFrame();
        await frame.waitForTimeout(1250);
        await frame.click(
          "button[data-test-id=order_summary_page-button-book]"
        );
        console.log("Clicked Reserve Now!");
        await frame.click(
          "button[data-test-id=order_summary_page-button-book]"
        );
        console.log("Confirmed reservation!");
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
        return;
      } catch {
        console.log("No available reservation at " + reservation_times[i]);
      }
    }

    // If no reservation is available, close browser
    console.log(
      "No available reservations within specified range - closing the program."
    );
    await browser.close();
    return;
  }
}

console.log(
  "Attempting to reserve a " +
    settings.time +
    " table for " +
    settings.seats.slice(-1) +
    " people at " +
    settings.restaurant +
    " on " +
    settings.date.slice(6)
);

start();

app.listen(3000);
