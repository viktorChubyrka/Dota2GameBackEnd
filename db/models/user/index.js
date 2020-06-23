const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  login: String,
  email: String,
  password: String,
  dotaID: Number,
  alphaAccount: Boolean,
  promoCode: String,
  blocked: Boolean,
  lastActive: Date,
  purse: Number,
  matches: Array,
  friendsInvited: Number,
});

module.exports = mongoose.model("Users", userSchema);
