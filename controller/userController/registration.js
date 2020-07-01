const saveToDB = require("./saveToDB");
const User = require("../../db/models/user");
const validation = require("../../helpers/validators");
const setInvite = require("./friendInvited");
const randomPromoCode = require("../../helpers/randomPromoCode");

async function registerUser(form) {
  const { login, email, password, cpassword, promoCode } = form;
  if (
    validation.isEmpty(login) ||
    validation.isEmpty(email) ||
    validation.isEmpty(password) ||
    validation.isEmpty(cpassword)
  )
    return {
      data: { status: 404, message: "First 4 fealds are requred" },
    };
  if (!validation.isSame(password, cpassword))
    return {
      data: { status: 404, message: "Password mismatch" },
    };
  if (!validation.isPasswordValid(password))
    return {
      data: { status: 404, message: "Password must by 8 or more symbols long" },
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
  let date = new Date();
  const userObj = {
    login,
    email,
    password,
    alphaAccount: true,
    promoCode: randomPromoCode(),
    blocked: false,
    lastActive: date,
    purse: 0,
    matches: [],
    friendsInvited: 0,
  };
  if (promoCode) {
    setInvite(promoCode);
  }
  await saveToDB(userObj);

  return {
    status: 200,
    message: "Registered",
  };
}
module.exports = registerUser;
