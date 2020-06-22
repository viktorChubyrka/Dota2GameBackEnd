const User = require("../../db/models/user");

module.exports = async function saveToDB(UserObj) {
  const newUser = new User({
    login: UserObj.login,
    email: UserObj.email,
    password: UserObj.password,
    dotaID: UserObj.dotaID,
    alphaAccount: UserObj.alphaAccount,
    promoCode: UserObj.promoCode,
  });

  const save = await newUser.save();

  return save;
};
