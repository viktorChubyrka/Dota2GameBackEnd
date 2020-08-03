const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const activeMatches = new Schema({
  creatorLogin: String,
  playersT1: [String],
  playersT2: { type: [String], default: [] },
  creationDate: Date,
  matchNumber: Number,
  gameType: String,
  status: String,
  gameData: { type: Object, default: {} },
});

module.exports = mongoose.model("Games", activeMatches);
