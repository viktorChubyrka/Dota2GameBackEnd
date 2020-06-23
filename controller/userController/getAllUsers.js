const User = require("../../db/models/user");

async function getAllUsers() {
  let allUsers = await User.find();
  let online = [];
  let ofline = [];

  allUsers.forEach((user) => {
    if (new Date() - user.lastActive > 300000) {
      ofline.push(user);
    } else online.push(user);
  });
  let users = { online, ofline };
  return users;
}

module.exports = getAllUsers;
