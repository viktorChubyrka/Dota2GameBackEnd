const User = require("../../db/models/user");

module.exports = async function saveToDB(UserObj) {
  const newUser = new User({
    login: UserObj.login,
    email: UserObj.email,
    password: UserObj.password,
    dotaID: null,
    alphaAccount: UserObj.alphaAccount,
    promoCode: UserObj.promoCode,
    lastActive: UserObj.lastActive,
    purse: UserObj.purse,
    maеches: UserObj.maеches,
    friendsInvited: UserObj.friendsInvited,
  });

  const save = await newUser.save();

  return save;
};
