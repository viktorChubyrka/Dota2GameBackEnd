const express = require("express");
const router = express.Router();

const user = require("./user");
const promo = require("./promo");
const game = require("./game");

router.use("/user", user);
router.use("/promo", promo);
router.use("/game", game);

module.exports = router;
