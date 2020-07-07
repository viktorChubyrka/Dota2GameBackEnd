const User = require("../../db/models/user");

async function changeName(data) {
  let { login, firstName, lastName } = data;
  let userModel = await User.findOne({ login });
  if (userModel) {
    userModel.name = firstName;
    userModel.surname = lastName;

    await User.updateOne({ login }, { $set: userModel });
    return {
      data: { status: 200, message: "" },
    };
  }
  return {
    data: { status: 404, message: "No user find" },
  };
}

module.exports = changeName;
