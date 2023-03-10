function toTitleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

function title_prep(string) {
  return toTitleCase(string).replace(/-/g, " ");
}

function url_prep(string) {
  return string.toLowerCase().replace(/ /g, "-");
}

function relevantTimes(time) {
  const timeObj = new Date(`1970-01-01 ${time}`);
  const roundedTime = new Date(
    Math.floor(timeObj / (15 * 60 * 1000)) * (15 * 60 * 1000)
  );

  const relevantTimes = [];
  for (let i = -2; i <= 2; i++) {
    if (i == 0) {
      continue;
    }
    const relevantTime = new Date(roundedTime.getTime() + i * 15 * 60 * 1000);
    const formattedTime = relevantTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    relevantTimes.push(formattedTime);
  }

  return relevantTimes;
}

function programTimer(str, startup_time) {
  var time, hours, minutes, seconds;
  time = str.slice(-2);

  if (time === "AM") {
    if (str.substr(0, str.indexOf(":")) === "12") {
      hours = 23;
    } else {
      hours = parseInt(str.substr(0, str.indexOf(":")));
    }
  } else {
    if (str.substr(0, str.indexOf(":")) === "12") {
      hours = 11;
    } else {
      hours = parseInt(str.substr(0, str.indexOf(":"))) + 12;
    }
  }

  if (parseInt(str.substr(str.indexOf(":") + 1)) === 0) {
    minutes = 59;
  } else {
    minutes = parseInt(str.substr(str.indexOf(":") + 1)) - 1;
  }

  seconds = startup_time;
  return [hours, minutes, seconds];
}

module.exports = {
  title_prep,
  url_prep,
  relevantTimes,
  programTimer,
};
