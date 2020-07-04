const User = require("../../db/models/user");

module.exports = async function saveToDB(UserObj) {
  const newUser = new User({
    login: UserObj.login,
    email: UserObj.email,
    password: UserObj.password,
    alphaAccount: UserObj.alphaAccount,
    promoCode: UserObj.promoCode,
    lastActive: UserObj.lastActive,
  });

  const save = await newUser.save();

  return save;
};
