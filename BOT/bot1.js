var steam = require("steam"),
  console = require("console"),
  fs = require("fs"),
  crypto = require("crypto"),
  dota2 = require("dota2"),
  steamClient = new steam.SteamClient(),
  steamUser = new steam.SteamUser(steamClient),
  steamFriends = new steam.SteamFriends(steamClient),
  Dota2 = new dota2.Dota2Client(steamClient, true);

const User = require("../db/models/user");
const Match = require("../db/models/match");
const Party = require("../db/models/party");

global.config = require("./configs/config1");
let users = [];
let matches = {};
var lobbygame;
var clients = {};
var ready;
let SetMatchResult = async (matchNumber, teamWin, players) => {
  let match = await Match.findOne({ matchNumber });

  for (let i = 0; i < players.length; i++) {
    let usersForFilter = matches[matchNumber];

    usersForFilter.filter((el) => {
      el.steamID.name == players[i].name;
    });
    let user = await User.findOne({ login: usersForFilter[0].login });
    players.forEach(async (el, index) => {
      if (el.name == user.steamID.name) {
        if (el.team == teamWin) {
          match.status = "win";
          user.matches.push(match);
          await User.updateOne({ login: user.login }, { $set: user });
        } else {
          match.status = "lose";
          user.matches.push(match);
          await User.updateOne({ login: user.login }, { $set: user });
        }
      }
    });
  }
  await Match.deleteOne({ matchNumber });
};
let StartGame = async (data) => {
  let { matchNumber, matchType, type } = data;
  let match = await Match.findOne({ matchNumber });
  if (matchType == "Solo") {
    let players = [...match.playersT1, ...match.playersT2];
    for (let i = 0; i < players.length; i++) {
      let user = await User.findOne({ login: players[i] });
      users.push(user);
    }
    users.filter((el) => el.ready == true);
    if (users.length == 2) {
      match.status = "playing";
      ready = 1;
      await Match.updateOne({ matchNumber }, { $set: match });
      return {
        status: "OK",
        users,
        matchNumber,
      };
    } else {
      return { status: "NOT" };
    }
  } else {
    if (match && match.playersT1[0] && match.playersT2[0]) {
      let party1 = await Party.findOne({ _id: match.playersT1[0] });
      let party2 = await Party.findOne({ _id: match.playersT2[0] });
      let players = [...party1.players, ...party2.players];
      players.forEach(async (el) => {
        let user = await User.findOne({ login: el.login });
        users.push(user);
      });
      users.filterl((el) => el.ready == true);
      if (users.length == 2) {
        match.status = "playing";
        ready = 1;
        await Match.updateOne({ matchNumber }, { $set: match });
        return {
          status: "OK",
          users,
          matchNumber,
        };
      } else {
        return { status: "NOT" };
      }
    } else {
      return { status: "NOT" };
    }
  }
};

module.exports = (webSocket) => {
  function createLobby(matchNumber) {
    var options = {
      game_name: "Match #" + matchNumber,
      server_region: 3,
      game_mode: 1,
      game_version: 1,
      allow_cheats: true,
      fill_with_bots: false,
      allow_spectating: true,
      pass_key: matchNumber + "",
      radiant_series_wins: 0,
      dire_series_wins: 0,
      allchat: false,
    };
    /*Конец конфига*/

    Dota2.createPracticeLobby(options, function (err, data) {
      if (JSON.stringify(data["result"]) == 1) {
        console.log("Лобби успешно создано");
      } else {
        console.log("Создать лобби не удалсоь");
      }
    });

    Dota2.joinPracticeLobbyTeam(1, 4, function (err, data) {
      if (JSON.stringify(data["result"]) == 1) {
        console.log("Бот занял место наблюдателя.");
      }
    });
    /*Invites*/
    setInterval(function () {
      if (ready == 1) {
        users.forEach(function (item, i, arr) {
          Dota2.inviteToLobby(item.steamID.id);
        });
        ready = 0;
      }
    }, 5000);
  }

  var onSteamLogOn = function onSteamLogOn(logonResp) {
      if (logonResp.eresult == steam.EResult.OK) {
        steamFriends.setPersonaState(steam.EPersonaState.Busy);
        steamFriends.setPersonaName("cGame.info|BOT #");
        console.log("Авторизован.");
        Dota2.launch();
        Dota2.on("ready", function () {
          console.log("Бот готов.");
          webSocket.on("connection", function connection(ws) {
            var id = Math.random();
            clients[id] = ws;
            console.log("новое соединение " + id);
            ws.on("message", async function (message) {
              let data = JSON.parse(message);
              console.log(data);
              switch (data.type) {
                case "StartGame":
                  let matchData = await StartGame(data);
                  if (matchData.status == "OK") {
                    createLobby(matchData.matchNumber);
                    matches[matchData.matchNumber + ""] = matchData.users;
                    for (var key in clients) {
                      clients[key].send(
                        JSON.stringify({
                          type: "LobbyUpdate",
                          Tab: 2,
                        })
                      );
                    }
                  }
                  break;
                default:
                  break;
              }
            });
          });
          Dota2.on("practiceLobbyUpdate", async function (lobby) {
            id = lobby.lobby_id + "";
            var status = lobby.match_outcome;
            var chat = 0;
            if (chat == 0) {
              Dota2.joinChat(lobby.game_name, 3);
            }
            if (status != 0) {
              switch (status) {
                case 1: //Победа тьмы
                  console.log("Победа тьмы");
                  status = 1;
                  await SetMatchResult(
                    lobby.game_name.split("#")[1],
                    status,
                    lobby["members"]
                  );
                  break;
                case 2: //Победа света
                  console.log("Победа света");
                  status = 0;
                  await SetMatchResult(
                    lobby.game_name.split("#")[1],
                    status,
                    lobby["members"]
                  );
                  break;
              }
            }
            var pn;
            lobby["members"].forEach(function (item, i, arr) {
              if (item.team == 1 || item.team == 0) {
                pn = i + 1;
                console.log(pn);
              }
            });
            if (pn == 2) {
              var launch = 0;
              if (launch == 0) {
                Dota2.sendMessage(
                  lobby.game_name,
                  "Игра начнется через 5 секунд!."
                );
                setTimeout(function () {
                  Dota2.launchPracticeLobby(function (err, data) {});
                  launch = 1;
                  Dota2.leavePracticeLobby();
                }, 5000);
              }
            } else pn = 0;
          });
        });

        Dota2.on("unready", function onUnready() {
          console.log("Node-dota2 unready.");
        });

        Dota2.on("chatMessage", function (channel, personaName, message) {
          console.log("[" + channel + "] " + personaName + ": " + message);
        });

        Dota2.on("unhandled", function (kMsg) {
          console.log("UNHANDLED MESSAGE #" + kMsg);
        });
      }
    },
    onSteamServers = function onSteamServers(servers) {
      console.log("Received servers.");
      fs.writeFile("servers", JSON.stringify(servers), () => {});
    },
    onSteamLogOff = function onSteamLogOff(eresult) {
      console.log("Logged off from Steam.");
    },
    onSteamError = function onSteamError(error) {
      console.log("Connection closed by server.");
    };
  // steamFriends.on("message", function (source, message, type, chatter) {
  //   console.log("Получено сообщение: " + message);
  //   switch (message) {
  //     case "Покинуть":
  //       Dota2.abandonCurrentGame();
  //       Dota2.leavePracticeLobby();
  //       Dota2.leaveChat("Lobby_" + id);
  //       steamFriends.sendMessage(
  //         source,
  //         "Покинул лобби #" + id,
  //         steam.EChatEntryType.ChatMsg
  //       );
  //       id = null;
  //       break;
  //     case "Статус":
  //       if (id != null) {
  //         var answer = "Нахожусь в лобби #" + id + ". Пароль от лобби: " + pass;
  //         steamFriends.sendMessage(
  //           source,
  //           answer,
  //           steam.EChatEntryType.ChatMsg
  //         );
  //       } else {
  //         steamFriends.sendMessage(
  //           source,
  //           "Ожидаю игру.",
  //           steam.EChatEntryType.ChatMsg
  //         );
  //       }
  //       break;
  //     case "Создать":
  //       createLobby();
  //       break;
  //     case "Пригласить админов":
  //       Dota2.inviteToLobby("76561198107070247");
  //       steamFriends.sendMessage(
  //         source,
  //         "Приглашение для админов было отправленно!" + source,
  //         steam.EChatEntryType.ChatMsg
  //       );
  //       break;
  //     case "Офф":
  //       Dota2.abandonCurrentGame();
  //       Dota2.leavePracticeLobby();
  //       Dota2.leaveChat("Lobby_" + id);
  //       Dota2.exit();
  //       steamClient.disconnect();

  //       break;
  //     case "Начать игру":
  //       Dota2.launchPracticeLobby(function (err, data) {});
  //       var answer = "Игра #" + id + " была начата!";
  //       steamFriends.sendMessage(source, answer, steam.EChatEntryType.ChatMsg);
  //       break;
  //     case "Кикнуть":
  //       Dota2.practiceLobbyKickFromTeam(Dota2.ToAccountID("76561198107070247"));
  //       steamFriends.sendMessage(
  //         source,
  //         "Игрок кикнут",
  //         steam.EChatEntryType.ChatMsg
  //       );
  //       break;
  //   }
  // });
  steamUser.on("updateMachineAuth", function (sentry, callback) {
    fs.writeFileSync("sentry", sentry.bytes);
    console.log("sentryfile saved");

    callback({
      sha_file: crypto.createHash("sha1").update(sentry.bytes).digest(),
    });
  });

  var logOnDetails = {
    account_name: global.config.steam_user,
    password: global.config.steam_pass,
  };
  if (global.config.steam_guard_code)
    logOnDetails.auth_code = global.config.steam_guard_code;

  try {
    var sentry = fs.readFileSync("sentry");
    if (sentry.length) logOnDetails.sha_sentryfile = sentry;
  } catch (beef) {
    console.log("Cannot load the sentry. " + beef);
  }

  steamClient.connect();

  steamClient.on("connected", function () {
    steamUser.logOn(logOnDetails);
  });

  steamClient.on("logOnResponse", onSteamLogOn);
  steamClient.on("loggedOff", onSteamLogOff);
  steamClient.on("error", onSteamError);
  steamClient.on("servers", onSteamServers);
};
