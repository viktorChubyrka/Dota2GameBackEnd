const User = require("../../db/models/user");

async function deleteFriend(login, friendLogin) {
  console.log(login, "____", friendLogin);
  let user = await User.findOne({ login });
  if (user.friends.includes(friendLogin)) {
    user.friends.splice(user.friends.indexOf(friendLogin), 1);
  }
  let friend = await User.findOne({ login: friendLogin });
  if (friend.friends.includes(login)) {
    friend.friends.splice(friend.friends.indexOf(login), 1);
  }
  await User.updateOne({ login }, { $set: user });
  await User.updateOne({ login: friendLogin }, { $set: friend });
}
module.exports = deleteFriend;
