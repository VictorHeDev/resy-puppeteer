# Resy Puppeteer

## Overview

This is a reservation bot for Resy built on Google's Puppeteer API and JavaScript.

## Notes
 - Settings field details must be exact! If you do not specify the correct restaurant details, the program will not run as it will open the wrong URL.
 - Your Resy account should be set up with a default credit card in case any restaurants with credit card requirements are prompted
 - Some popular restaurants and their respective release times have been detailed in RESTAURANTS.md

## Mac OSX Walkthrough
1. Clone or fork this repository.
2. Open the folder in your terminal and npm install.
3. In settings folder, create a `login.json` file in the following format. Replace the email and password fields with your Resy account login details. This file is in .gitignore so it should never show up on GitHub.
```
{
  "email": "youremail@email.com",
  "password": "********"
}
```
4. In settings.json, change the fields to match the restaurant, city, desired date, seats, time, and type. The range will allow the script to look for reservations close to the desired time within 15-minute increments (for example: a range of 4 will allow a one hour range from your desired time).
5. In program.json, change the fields to match the restaurant's reservation release date. This is usually detailed on either the restaurant's Resy page or on their website. The buffer is the amount of seconds that the program will start earlier than the release date - this is to ensure that the Chromium test browser that opens will be logged in by the time the reservations are released. If you want to specify the cron job schedule to attempt the reservation for a specified day, month, or weekday, you can do so by changing the "day" (1-31), "month"(1-12), or "weekday"(0-6) fields to numeric digits. Otherwise, the cron job will default to run the script every day at the specified release time.
6. If your release time is at a time that you do not wish to wait for, open a separate terminal -> type `caffeinate` -> enter; This will prevent your Macbook from going into sleep mode which will lock out your cron job. Note: cron jobs are built-in using node-cron module. If you want to build your own bash script to prevent your Macbook from sleeping then feel free to do so.
7. In a new terminal: type `node index.js` -> enter; You should see a reply stating that the script will run at the defined release time with the reservation details.
8. Check after the reservation release times to determine whether the bot has succeeded in grabbing a reservation.

## Features

- [x] Reserve a specified seat at a specified restaurant
- [x] Measure how long it takes to run and successfully grab a reservation
- [x] Reserve any available seat if specified seat not available (within a range)
- [x] Automatically start up on its own
