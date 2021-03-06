require("dotenv").config({ path: `${__dirname}/.env` });

const ENV = process.env;
const NODE_ENV = ENV.NODE_ENV;

const REQUIRED_CONFIG = ["NODE_ENV", "MONGO_DB_URL", "PORT", "SECRET"];

REQUIRED_CONFIG.forEach((field) => {
  console.log(field);
  if (!ENV.hasOwnProperty(field)) {
    throw new Error("Missing required config!");
  }
});

module.exports = Object.freeze({
  NODE_ENV,

  PORT: ENV.PORT || 3000,

  MONGO_DB_URL: ENV.MONGO_DB_URL,
  MONGO_DB_NAME: ENV.MONGO_DB_NAME,
  SECRET: ENV.SECRET,
});
