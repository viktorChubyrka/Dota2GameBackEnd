const isEmpty = (str) => {
  if (str === undefined || str === "") {
    return true;
  }
  return false;
};

const isPasswordValid = (password) => {
  if (password.length <= 8 && password === "") {
    return false;
  }
  return true;
};

const isEmailValid = (email) => {
  const regEx = /\S+@\S+\.\S+/;
  return regEx.test(email);
};

const isSame = (first, second) => {
  if (first === second) {
    return true;
  }
  return false;
};

module.exports = { isEmailValid, isSame, isPasswordValid, isEmpty };
