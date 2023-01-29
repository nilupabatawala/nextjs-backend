require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();

//serve static files
app.use("/", express.static(path.join(__dirname, "/public")));

// built-in middleware for json
app.use(express.json());

require("./routes")(app);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.info(`Listening on port ${PORT}...`));
