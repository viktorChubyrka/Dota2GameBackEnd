const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const partys = new Schema({
  creatorLogin: String,
  players: { type: Array, default: [] },
});

module.exports = mongoose.model("Party", partys);
