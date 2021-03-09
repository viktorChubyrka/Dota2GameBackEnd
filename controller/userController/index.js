const login = require("./login");
const registration = require("./registration");
const getAllUsers = require("./getAllUsers");
const newPassword = require("./newPassword");
const getUserData = require("./getUserData");
const changeName = require("./changeName");
const changeContactInfo = require("./changeContactInfo");
const saveProfilePhoto = require("./saveProfilePhoto");
const getUsers = require("./getUsers");
const setAmount = require("./setAmount");
const createWithdraw = require("./createWithdraw");
const tutorialComplited = require("./tutorialComplited");
const deletePhoto = require("./deletePhoto");

module.exports = {
  login,
  registration,
  getAllUsers,
  newPassword,
  getUserData,
  changeName,
  changeContactInfo,
  saveProfilePhoto,
  getUsers,
  setAmount,
  createWithdraw,
  tutorialComplited,
  deletePhoto,
};
