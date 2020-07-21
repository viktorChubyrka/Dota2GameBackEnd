const express = require("express");
const router = express.Router();
const gameController = require("../../../controller/gameController");

router.get("/getAllGames", async (req, res) => {
  let matches = await gameController.getAllMatches();
  res.send(matches);
});

module.exports = router;
