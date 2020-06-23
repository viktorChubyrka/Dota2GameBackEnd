const lastActive = require("../controller/userController/setLastActive");

async function setLastActive(req, res, next) {
  await lastActive(req.body.login);

  next();
}

module.exports = setLastActive;
