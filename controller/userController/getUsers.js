const User = require("../../db/models/user");

async function getUsers() {
  let allUsers = await User.find();

  return allUsers;
}

module.exports = getUsers;
