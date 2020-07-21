const Match = require("../../db/models/match");

async function getAllMatches() {
  let matches = await Match.find();
  return matches;
}

module.exports = getAllMatches;
