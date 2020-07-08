const cors = require("cors");
const config = require("./config");
const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes");
const app = express();
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

app.use(
  cors({
    origin: "https://dota2gamebot.herokuapp.com",

    credentials: true,
  })
);

app.use(express.static("uploads"));
app.use(bodyParser.json({ limit: "500kb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    store: new MongoStore({ url: config.MONGO_DB_URL }),
    resave: false,
    saveUninitialized: false,
    secret: config.SECRET,
  })
);

app.use("/", routes);

module.exports = app;
