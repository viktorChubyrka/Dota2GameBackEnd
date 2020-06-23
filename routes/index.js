const express = require("express");
const api = require("./api");
const router = express.Router();

const setLastActive = require("../middleware/lastUserActive");

router.use(setLastActive);

router.use("/api", api);

module.exports = router;
