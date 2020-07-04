const validation = require("../../helpers/validators");
const User = require("../../db/models/user");

async function loginUser(form) {
  const { login, password } = form;
  if (validation.isEmpty(login)) {
    return {
      data: { status: 404, message: "Pleace enter a valid login" },
    };
  }
  let userModel = await User.findOne({ login });
  if (!userModel)
    return {
      data: { status: 404, message: "No search user" },
    };
  if (!validation.isSame(password, userModel.password))
    return {
      data: { status: 404, message: "Wrong password" },
    };
  return {
    data: { status: 200, message: "Logined", login },
  };
}

module.exports = loginUser;
