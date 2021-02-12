const User = require("../../db/models/user");

async function setAmount(login, amount) {
  let user = await User.findOne({ login });
  user.purse += +amount;
  user.transactions.push({ value: amount, type: "deposit", date: Date.now() });
  await User.updateOne({ login }, user);
}

module.exports = setAmount;
