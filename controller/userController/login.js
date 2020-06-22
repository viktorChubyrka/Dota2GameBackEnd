const validation = require("../../helpers/validators");
const User = require("../../db/models/user");

async function loginUser(form) {
  const { email, password } = form;
  if (!validation.isEmailValid(email)) {
    return {
      data: { status: 404, message: "Pleace enter a valid email" },
    };
  }
  let userModel = await User.findOne({ email });
  if (!userModel)
    return {
      data: { status: 404, message: "No search user" },
    };
  if (!validation.isSame(password, userModel.password))
    return {
      data: { status: 404, message: "Wrong password" },
    };
  return {
    data: { status: 200, message: "Logined" },
  };
}

module.exports = loginUser;
