const User = require("../../db/models/user");
const validation = require("../../helpers/validators");

async function newPassword(email, password, cpassword) {
  let userModel = await User.findOne({ email });

  if (!validation.isSame(password, cpassword)) {
    return {
      data: { status: 404, message: "Password mismatch" },
    };
  }

  if (userModel) {
    userModel.password = password;

    await User.updateOne({ email }, { $set: userModel });
    return {
      data: { status: 200, message: "" },
    };
  }
  return {
    data: { status: 404, message: "No user find width this email" },
  };
}

module.exports = newPassword;
