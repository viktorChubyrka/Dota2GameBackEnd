const express = require("express");

const userController = require("../../../../controller").userController;

const router = express.Router();

router.post("/registr", async (req, res) => {
  let newUser = await userController.registration.registerUser(req.body);
  res.send(newUser);
});

router.post("/login", async (req, res) => {
  let login = await userController.login.loginUser(req.body);
  res.send(login);
});

module.exports = router;
