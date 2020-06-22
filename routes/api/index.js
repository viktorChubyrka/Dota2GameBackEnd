const express = require("express");
const router = express.Router();

const user = require("./user");

console.log("2");
router.use("/user", user);

module.exports = router;
