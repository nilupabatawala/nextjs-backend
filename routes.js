const { site } = require("./routes/");
const path = require("path");

module.exports = function (app) {
  // app.get("^/$|/index(.html)?", (req, res) => {
  //   res.sendFile(path.join(__dirname, "./views", "index.html"));
  // });

  app.use("/", site);
};
