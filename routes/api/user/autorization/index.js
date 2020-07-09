const express = require("express");

const userController = require("../../../../controller/userController");

const router = express.Router();

router.post("/registration", async (req, res) => {
  let newUser = await userController.registration(req.body);
  res.send(newUser);
});

router.post("/login", async (req, res) => {
  let login = await userController.login(req.body);
  if (login.data.status == 200) req.session.login = req.body.login;
  console.log(req.session.login);
  console.log(req.session.id);
  res.send(login);
});

router.get("/logOut", async (req, res) => {
  req.session.destroy();
  res.send({ status: "200" });
});

module.exports = router;
