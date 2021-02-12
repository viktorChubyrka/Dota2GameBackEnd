const User = require("../../db/models/user");
const axios = require("axios");

async function testWithdraw(data) {
  let user = await User.findOne({ login: data.login });
  if (data.amount <= user.purse) {
    console.log(user.purse);
    let res = await axios.post("https://core.piastrix.com/withdraw/try", data, {
      headers: { "Content-Type": "application/json" },
    });
    return res;
  } else {
    return { data: { data: null } };
  }

  //   let arrayOfStrings = req.data.replace(/\r?\n/g, "");
  //   arrayOfStrings = arrayOfStrings.replace(
  //     /"account_info_config"/i,
  //     '"account_info_config": '
  //   );
  //   arrayOfStrings = arrayOfStrings.replace(/ /i, "");
  //   arrayOfStrings =
  //     arrayOfStrings.split('"account":')[1].split(" } ")[0].split(" { ")[1] + "}";
  //   arrayOfStrings = arrayOfStrings.split("  ");
  //   let clearStr = "";
  //   arrayOfStrings.forEach((e) => {
  //     if (e.length > 0) clearStr += e;
  //   });
  //   return JSON.parse("{" + clearStr);
}
async function testPayData(data) {
  let user = await User.findOne({ login: data.login });
  if (data.amount <= user.purse) {
    console.log(user.purse);
    let res = await axios.post(
      "https://core.piastrix.com/check_account",
      data,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return { status: res.data.result, message: res.data.message };
  } else {
    return { status: false, message: "Fail" };
  }
}
async function sendWithdraw(data) {
  let user = await User.findOne({ login: data.login });
  if (data.amount <= user.purse) {
    console.log(user.purse);
    let res = await axios.post(
      "https://core.piastrix.com/withdraw/create",
      data,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    if (res.data.result) {
      user.purse -= +amount;
      user.transactions.push({
        value: amount,
        type: "withdraw",
        date: Date.now(),
      });
    }
    return { status: res.data.result, message: res.data.message };
  } else {
    return { status: false, message: "Fail" };
  }
}

module.exports = { testWithdraw, testPayData, sendWithdraw };
