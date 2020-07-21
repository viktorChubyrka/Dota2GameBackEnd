const mongoose = require("mongoose");
const config = require("../config");

module.exports.connect = connect = () => {
  try {
    mongoose.connect(config.MONGO_DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.log(error);
  }
};
