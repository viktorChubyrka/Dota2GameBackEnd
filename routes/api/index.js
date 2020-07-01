const express = require("express");
const router = express.Router();

const user = require("./user");
const promo = require("./promo");

router.use("/user", user);
router.use("/promo", promo);

module.exports = router;
