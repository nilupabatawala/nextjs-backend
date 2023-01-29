const _ = require("lodash");

const makeUrl = (initial_string) => {
  if (!initial_string || !isNaN(initial_string)) return initial_string;
  return initial_string
    .replaceAll(", ", "-")
    .replaceAll(" ", "-")
    .replaceAll("/", "")
    .replaceAll("&", "")
    .replaceAll("  ", " ")
    .toLowerCase();
};

const fixTrimSpace = (str) => {
  if (!str || !isNaN(str)) return str;
  return str.trim().replace(/  +/g, " ");
};

const myUcFirst = (str) => {
  if (!str || !isNaN(str)) return str;
  return _.startCase(_.toLower(str));
};

module.exports = {
  makeUrl,
  fixTrimSpace,
  myUcFirst,
};
