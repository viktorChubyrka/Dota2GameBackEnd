const cors = require("cors");

const express = require("express");
const bodyParser = require("body-parser");

const routes = require("./routes");
const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "500kb" }));
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/", routes);

module.exports = app;
