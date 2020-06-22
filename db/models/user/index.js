const mongoose = require("mongoose");
const { strict } = require("assert");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  login: String,
  email: String,
  password: String,
  dotaID: Number,
  alphaAccount: Boolean,
  promoCode: String,
});

module.exports = mongoose.model("Users", userSchema);
