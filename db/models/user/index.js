const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  login: String,
  email: String,
  photo: {
    type: String,
    default: "",
  },
  number: {
    type: String,
    default: "",
  },
  password: String,
  steamID: {
    type: Object,
    default: { name: "", id: "" },
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
  transactions: { type: Array, default: [] },
  matches: {
    type: Array,
    default: [],
  },
  friends: {
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
  notifications: {
    type: Array,
    default: [],
  },
  partyID: {
    type: String,
    default: "",
  },
  ready: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Users", userSchema);
