const User = require("../../db/models/user");

async function setLastActive(login) {
  let userModel = await User.findOne({ login });

  if (userModel) {
    userModel.lastActive = new Date();

    await User.updateOne({ login }, { $set: userModel });
    return true;
  }
  return false;
}

module.exports = setLastActive;
