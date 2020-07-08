const login = require("./login");
const registration = require("./registration");
const getAllUsers = require("./getAllUsers");
const newPassword = require("./newPassword");
const getUserData = require("./getUserData");
const changeName = require("./changeName");
const changeContactInfo = require("./changeContactInfo");
const saveProfilePhoto = require("./saveProfilePhoto");

module.exports = {
  login,
  registration,
  getAllUsers,
  newPassword,
  getUserData,
  changeName,
  changeContactInfo,
  saveProfilePhoto,
};
