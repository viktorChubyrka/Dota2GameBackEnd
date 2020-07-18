const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const activeMatches = new Schema({
  creatorLogin: String,
  playersT1: Array,
  playersT2: Array,
  creationDate: Date,
  matchNumber: Number,
  gameType: String,
  status: String,
  gameData: Object,
});

module.exports = mongoose.model("Games", activeMatches);
