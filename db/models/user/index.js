const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  login: String,
  email: String,

  number: {
    type: String,
    default: "",
  },
  password: String,
  steamID: {
    type: Number,
    default: null,
  },
  alphaAccount: Boolean,
  promoCode: String,
  blocked: {
    type: Boolean,
    default: false,
  },
  lastActive: Date,
  purse: {
    type: Number,
    default: 0,
  },
  matches: {
    type: Array,
    default: [],
  },
  friendsInvited: {
    type: Number,
    default: 0,
  },
  name: {
    type: String,
    default: "",
  },
  surname: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("Users", userSchema);
