const User = require("../../db/models/user");
const { forEach } = require("lodash");

async function getAllUsers(userLogin) {
  let allUsers = await User.find();
  let data = await User.findOne({ login: userLogin });
  let userFriends = data.friends;
  let usersToSend = [];
  let user = {};
  allUsers.forEach((el) => {
    if (el.login != userLogin) {
      let isFriend = false;
      userFriends.forEach((friend) => {
        if (friend == el.login) {
          isFriend = true;
        }
      });
      if (!isFriend) {
        user.login = el.login;
        user.photo = el.photo;
        usersToSend.push(user);
        user = {};
      }
    }
  });
  return usersToSend;
}

module.exports = getAllUsers;
