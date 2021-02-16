const User = require("../../db/models/user");

async function tutorialComplited(login) {
  let user = await User.findOne({ login });
  user.tutorial = false;
  await User.updateOne({ login }, user);
}

module.exports = tutorialComplited;
