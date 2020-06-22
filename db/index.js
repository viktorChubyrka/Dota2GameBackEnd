const mongoose = require("mongoose");
const config = require("../config");

module.exports.func = func = () => {
  try {
    mongoose.connect(config.MONGO_DB_URL, { useNewUrlParser: true });
  } catch (error) {
    console.log(error);
  }
};
