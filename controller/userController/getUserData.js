const validation = require("../../helpers/validators");
const User = require("../../db/models/user");

async function getUserData(login) {
  let userModel = await User.findOne({ login });
  if (!userModel)
    return {
      data: { status: 404, message: "No search user" },
    };

  return {
    data: { status: 200, message: "Ok", userModel },
  };
}

module.exports = getUserData;
