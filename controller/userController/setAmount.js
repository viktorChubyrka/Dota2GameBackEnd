const User = require("../../db/models/user");

async function setAmount(login, amount, shop_order_id) {
  let user = await User.findOne({ login });
  let isInTransactions = false;
  if (user.transactions)
    user.transactions.forEach((el) => {
      if (el.shop_order_id == shop_order_id) {
        isInTransactions = true;
      }
    });
  if (!isInTransactions) {
    user.purse += +amount;
    user.transactions.push(
      { value: amount, type: "deposit", date: Date.now() },
      shop_order_id
    );
    await User.updateOne({ login }, user);
  }
}

module.exports = setAmount;
