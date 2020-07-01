const mongoose = require("mongoose");
const config = require("../config");

module.exports.connect = connect = () => {
  try {
    mongoose.connect(
      "mongodb+srv://Dota2BotAdmin:dota2botadmin@cluster0-vvhtz.mongodb.net/Dota2?retryWrites=true&w=majority",
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
  } catch (error) {
    console.log(error);
  }
};
