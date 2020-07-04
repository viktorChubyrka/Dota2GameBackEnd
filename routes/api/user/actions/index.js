const express = require("express");

const userController = require("../../../../controller/userController");
const emailSender = require("../../../../helpers/emailSender");

const router = express.Router();

router.get("/getUsers", async (req, res) => {
  let allUsers = await userController.getAllUsers(req);
  res.send(allUsers);
});

router.post("/getUserData", async (req, res) => {
  console.log(req.session.login);
  if (req.session.login) {
    let userData = await userController.getUserData(req.body.login);
    res.send(userData);
  } else {
    let data = {
      status: "404",
      message: "No session",
    };
    res.send({ data });
  }
});
router.post("/restorePassword", async (req, res) => {
  let { email } = req.body;
  let data = await emailSender(email);
  console.log(data);
  res.send(data);
});
router.post("/newPassword", async (req, res) => {
  let { email, password, cpassword } = req.body;
  let data = await userController.newPassword(email, password, cpassword);
  res.send(data);
});

module.exports = router;
