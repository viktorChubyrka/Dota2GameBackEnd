const mongoose = require("mongoose");
const { stringify } = require("uuid");
const Schema = mongoose.Schema;

const reportShema = new Schema({
  login: { type: String, default: "Not registered user" },
  email: String,
  reportTopic: {
    type: String,
    default: "Report from promo",
  },
  reportDescription: String,
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Reports", reportShema);
