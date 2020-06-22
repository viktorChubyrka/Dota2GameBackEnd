const express = require("express");
const api = require("./api");
const router = express.Router();

console.log("1");
router.use("/api", api);

module.exports = router;
