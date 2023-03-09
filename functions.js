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

module.exports = {
  title_prep,
  url_prep,
  relevantTimes,
};