const User = require("../../db/models/user");
const validation = require("../../helpers/validators");

async function changeContactInfo(data) {
  let { login, loginChange, email, phone, steamID } = data;
  let userModel = await User.findOne({ login });
  if (userModel) {
    if (validation.isEmailValid(email)) {
      userModel.email = email;
    }
    if (!validation.isEmpty(loginChange)) {
      userModel.login = loginChange;
    }
    userModel.number = phone;
    userModel.steamID = steamID;
    await User.updateOne({ login }, { $set: userModel });
    return {
      data: { status: 200, message: "" },
    };
  } else
    return {
      data: { status: 404, message: "No user find" },
    };
}

module.exports = changeContactInfo;
