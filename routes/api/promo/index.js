const express = require("express");
const sendEmail = require("../../../helpers/emailSender");
const router = express.Router();

router.post("/askQuestion", async (req, res) => {
  const { message, email } = req.body;
  let info = sendEmail().catch(console.error);
  res.send(info);
});

module.exports = router;
