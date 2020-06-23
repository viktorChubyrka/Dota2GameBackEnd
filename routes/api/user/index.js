const express = require("express");
const router = express.Router();

const autorization = require("./autorization");
const actions = require("./actions");

router.use("/autorization", autorization);
router.use("/actions", actions);

module.exports = router;
