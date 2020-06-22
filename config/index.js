require("dotenv").config({ path: `${__dirname}/.env` });

const ENV = process.env;
const NODE_ENV = ENV.NODE_ENV;

const REQUIRED_CONFIG = [
  "NODE_ENV",
  "MONGO_DB_URL",
  "MONGO_DB_NAME",
  "PORT",
  "HOST",
];

REQUIRED_CONFIG.forEach((field) => {
  console.log(field);
  if (!ENV.hasOwnProperty(field)) {
    throw new Error("Missing required config!");
  }
});

module.exports = Object.freeze({
  NODE_ENV,

  HOST: ENV.HOST || "127.0.0.1",
  PORT: ENV.PORT ? +ENV.PORT : 4040,

  MONGO_DB_URL: ENV.MONGO_DB_URL,
  MONGO_DB_NAME: ENV.MONGO_DB_NAME,
});
