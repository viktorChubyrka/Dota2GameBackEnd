const express = require("express");
const router = express.Router();

const autorization = require("./autorization");

router.use("/autorization", autorization);

module.exports = router;
