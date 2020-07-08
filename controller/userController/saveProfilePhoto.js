const User = require("../../db/models/user");

async function saveProfilePhoto(link, login) {
  let userModel = await User.findOne({ login });
  if (userModel) {
    userModel.photo = link;
    await User.updateOne({ login }, { $set: userModel });
    return {
      data: { status: 200, message: "" },
    };
  }
  return {
    data: { status: 404, message: "No user find" },
  };
}

module.exports = saveProfilePhoto;
