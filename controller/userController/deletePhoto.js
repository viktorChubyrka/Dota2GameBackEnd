const User = require("../../db/models/user");

async function deletePhoto(login) {
  let user = await User.findOne({ login });
  user.photo = "";

  await User.updateOne({ login }, { $set: user });
}
module.exports = deletePhoto;
