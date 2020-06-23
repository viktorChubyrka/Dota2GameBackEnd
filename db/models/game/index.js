const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const gameSchema = new Schema({
  players: Array,
});

module.exports = mongoose.model("Games", gameSchema);
