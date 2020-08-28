const express = require("express");
var multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + ".jpg");
  },
});

var upload = multer({ storage: storage });

const userController = require("../../../../controller/userController");
const emailSender = require("../../../../helpers/emailSender");

const router = express.Router();

var type = upload.single("file");
router.post("/sendFile", type, async function (req, res) {
  let path = "https://safe-inlet-79254.herokuapp.com/" + req.file.filename;
  await userController.saveProfilePhoto(path, req.body.login);
});
router.get("/getAllUsers", async (req, res) => {
  if (req.session.login) {
    let users = await userController.getAllUsers(req.session.login);
    res.send({ status: "200", users });
  } else {
    let data = {
      status: "404",
      message: "No session",
    };
    res.send({ data });
  }
});
router.get("/getAllReadyUsers", async (req, res) => {
  let ready = 0;
  if (req.session.login) {
    let users = await userController.getUsers();
    for (let i = 0; i < users.length; i++) {
      if (users[i].ready) ready += 1;
    }
    res.send({ status: "200", ready });
  } else {
    let data = {
      status: "404",
      message: "No session",
    };
    res.send({ data });
  }
});

router.post("/getUserData", async (req, res) => {
  console.log(req.session.login, req.body.login);
  if (req.session && req.body.login) {
    let userData = await userController.getUserData(req.session.login);
    res.send(userData);
  } else {
    let data = {
      status: "404",
      message: "No session",
    };
    res.send({ data });
  }
});
router.post("/", async (req, res) => {
  if (req.session.login) {
    res.send("200");
  } else res.send("400");
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
  log(req.session.login);
  if (req.session.login) {
    if (req.body.login != req.session.login) req.session.login = req.body.login;
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
