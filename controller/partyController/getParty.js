const Party = require("../../db/models/party");

async function getParty(partryId) {
  let party = await Party.findOne({ _id: partryId });
  if (party) {
    return party;
  } else {
    return party;
  }
}

module.exports = getParty;
