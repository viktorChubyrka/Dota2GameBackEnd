const User = require("../../db/models/user");

async function tutorialComplited(login, val) {
  let user = await User.findOne({ login });
  user.tutorial = val;
  console.log(user);
  await User.updateOne({ login }, user);
}

module.exports = tutorialComplited;
