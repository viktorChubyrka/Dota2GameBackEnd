const express = require("express");

const userController = require("../../../../controller");

const router = express.Router();

router.get("/getUsers", async (req, res) => {
  let allUsers = await userController.getAllUsers();
  res.send(allUsers);
});

module.exports = router;
