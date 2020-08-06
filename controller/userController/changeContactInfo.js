const User = require("../../db/models/user");
const validation = require("../../helpers/validators");
const Axios = require("axios");

async function changeContactInfo(data) {
  let { login, loginChange, email, phone, steamID } = data;
  let name = await Axios.get(
    "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=DD3E4897973E8764BB4DCE6B44F266CA&format=json&steamids=" +
      steamID
  );
  let readySteamID = {
    id: steamID,
    name: name.data.response.players[0].personaname,
  };
  console.log(name.data.response.players[0].personaname);
  let userModel = await User.findOne({ login });
  if (userModel) {
    if (validation.isEmailValid(email)) {
      userModel.email = email;
    }
    if (!validation.isEmpty(loginChange)) {
      userModel.login = loginChange;
    }
    userModel.number = phone;
    userModel.steamID = readySteamID;
    await User.updateOne({ login }, { $set: userModel });
    return {
      data: { status: 200, message: "" },
    };
  } else
    return {
      data: { status: 404, message: "No user find" },
    };
}

module.exports = changeContactInfo;
