const User = require("../../db/models/user");

async function invitedFriend(promoCode) {
  let user = await User.findOne({ promoCode });
  user.friendsInvited = user.friendsInvited + 1;

  await User.updateOne({ promoCode }, { $set: user });
}

module.exports = invitedFriend;
