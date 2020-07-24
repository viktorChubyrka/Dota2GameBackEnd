const express = require("express");
const router = express.Router();
const gameController = require("../../../controller/gameController");
const partyController = require("../../../controller/partyController");

router.get("/getAllGames", async (req, res) => {
  let matches = await gameController.getAllMatches();
  res.send(matches);
});

router.post("/party", async (req, res) => {
  let party = await partyController.getParty(req.body.partyId);
  res.send(party);
});

module.exports = router;
