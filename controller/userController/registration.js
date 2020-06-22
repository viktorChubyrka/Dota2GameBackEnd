const saveToDB = require("./saveToDB");
const User = require("../../db/models/user");
const validation = require("../../helpers/validators");

async function registerUser(form) {
  const { login, email, password, dotaID } = form;
  if (
    validation.isEmpty(login) ||
    validation.isEmpty(email) ||
    validation.isEmpty(password)
  )
    return {
      data: { status: 404, message: "All fealds are requred" },
    };
  if (!validation.isEmailValid(email))
    return {
      data: { status: 404, message: "Email is not valid" },
    };
  let userModel = await User.findOne({ login });
  if (userModel)
    return {
      data: { status: 404, message: "Login is already used" },
    };
  userModel = await User.findOne({ email });
  if (userModel)
    return {
      data: { status: 404, message: "Email is already used" },
    };

  const userObj = {
    login,
    email,
    password,
    dotaID,
    alphaAccount: true,
    promoCode: "dsa",
  };
  await saveToDB(userObj);

  return {
    status: 200,
    message: "Registered",
  };
}
module.exports = registerUser;
