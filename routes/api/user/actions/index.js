const express = require("express");
var multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + ".jpg"); //Appending .jpg
  },
});

var upload = multer({ storage: storage });

const userController = require("../../../../controller/userController");
const emailSender = require("../../../../helpers/emailSender");

const router = express.Router();

var type = upload.single("file");
router.post("/sendFile", type, async function (req, res) {
  let path = "https://dota2botbackend.herokuapp.com/" + req.file.filename;
  await userController.saveProfilePhoto(path, req.body.login);
});

router.post("/getUserData", async (req, res) => {
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
router.post("/changeName", async (req, res) => {
  console.log("sadsa");
  if (req.session.login) {
    let newUserData = await userController.changeName(req.body);
    res.send(newUserData);
  } else {
    let data = {
      status: "404",
      message: "No session",
    };
    res.send({ data });
  }
});
router.post("/changeContactInfo", async (req, res) => {
  if (req.session.login) {
    let newUserData = await userController.changeContactInfo(req.body);
    res.send(newUserData);
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
