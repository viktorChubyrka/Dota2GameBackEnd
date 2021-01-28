var steam = require("steam"),
  console = require("console"),
  fs = require("fs"),
  crypto = require("crypto"),
  dota2 = require("dota2"),
  steamClient = new steam.SteamClient(),
  steamUser = new steam.SteamUser(steamClient),
  steamFriends = new steam.SteamFriends(steamClient),
  Dota2 = new dota2.Dota2Client(steamClient, true, true);

const User = require("../db/models/user");
const Match = require("../db/models/match");
const Party = require("../db/models/party");

global.config = require("./configs/config1");
let users = [];
let matches = {};
var clients = {};
let creatingLobby = false;
let areLobbySettingsAdd = false;
let isLobbyBalanced = false;
let isInLobbyChat = false;
let currentMatch;
let isLobbyFool = false;
let canCheckMatchStart = false;
let partyMessage = true;
var ready;
let SetMatchResult = async (
  matchNumber,
  teamWin,
  players,
  matchID,
  clients
) => {
  if (matchNumber) {
    let match = await Match.findOne({ matchNumber });
    for (let i = 1; i < players.length; i++) {
      let user = await User.findOne({ "steamID.name": players[i].name });
      if (user) {
        if (players[i].team == teamWin) {
          if (players[i].leaver_status != 0) {
            match.status = "Техническое поражение";
            match.matchNumber = matchID;
            user.matches.push(match);
            await User.updateOne({ login: user.login }, { $set: user });
            user = {};
          } else {
            match.status = "win";
            match.matchNumber = matchID;
            user.matches.push(match);
            user.purse += 2;
            await User.updateOne({ login: user.login }, { $set: user });
            user = {};
          }
        } else {
          if (players[i].leaver_status != 0) {
            match.status = "Техническое поражение";
            match.matchNumber = matchID;
            user.matches.push(match);
            await User.updateOne({ login: user.login }, { $set: user });
            user = {};
          } else {
            match.status = "lose";
            match.matchNumber = matchID;
            user.matches.push(match);
            await User.updateOne({ login: user.login }, { $set: user });
            user = {};
          }
        }
      }
    }
    players = [...match.playersT1, ...match.playersT2];
    await Match.deleteOne({ matchNumber });
    for (let i = 0; i < players.length; i++) {
      for (var key in clients) {
        if (players[i] == clients[key].login) {
          clients[key].send(
            JSON.stringify({
              type: "LobbyUpdate",
              Tab: 1,
            })
          );
        }
      }
    }
  }
};
let StartGame = async (matchNumber) => {
  let a = await Match.findOne({ matchNumber });
  if (a.playersT1.length + a.playersT2.length == 10) {
    currentMatch = a;
    currentMatch.status = "playing";
    await Match.updateOne({ matchNumber }, currentMatch);
    for (let i = 0; i < currentMatch.playersT1.length; i++) {
      let player = await User.findOne({ login: currentMatch.playersT1[i] });
      player.purse -= 1;
      await User.updateOne({ login: currentMatch.playersT1[i] }, player);
      currentMatch.playersT1[i] = { ...player.steamID, login: player.login };
    }
    for (let i = 0; i < currentMatch.playersT2.length; i++) {
      let player = await User.findOne({ login: currentMatch.playersT2[i] });
      await User.updateOne({ login: currentMatch.playersT1[i] }, player);
      currentMatch.playersT2[i] = { ...player.steamID, login: player.login };
    }
    console.log(currentMatch);
    creatingLobby = true;
  }
};

module.exports = async (webSocket) => {
  Dota2.leavePracticeLobby();
  Dota2.abandonCurrentGame();

  async function createLobby(matchNumber) {
    Dota2.abandonCurrentGame();
    var options = {
      game_name: "Match#" + currentMatch.matchNumber,
      server_region: 3,
      game_mode: 2,
      game_version: 1,
      allow_cheats: true,
      fill_with_bots: false,
      allow_spectating: true,
      pass_key: matchNumber + "",
      radiant_series_wins: 0,
      dire_series_wins: 0,
      allchat: true,
    };
    /*Конец конфига*/

    await Dota2.createPracticeLobby(options, function (err, data) {
      if (JSON.stringify(data["result"]) == 1) {
        console.log("Лобби успешно создано");
      } else {
        console.log("Создать лобби не удалсоь");
      }
    });
    await Dota2.joinPracticeLobbyTeam(1, 4, function (err, data) {
      console.log("Бот занял место наблюдателя.");
      if (JSON.stringify(data["result"]) == 1) {
      }
    });

    // matchUsers.forEach((el, index) => {
    //   if (index == 0)
    //     Dota2.sendMessage("Команда сил света:", "Match #" + matchNumber, 3);
    //   if (index == 5)
    //     Dota2.sendMessage("Команда сил тьмы:", "Match #" + matchNumber, 3);
    //   Dota2.sendMessage(el.steamID.name, "Match #" + matchNumber, 3);
    // });

    /*Invites*/
  }

  var onSteamLogOn = function onSteamLogOn(logonResp) {
      if (logonResp.eresult == steam.EResult.OK) {
        steamFriends.setPersonaState(steam.EPersonaState.Busy);
        steamFriends.setPersonaName("Darevin's club");
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
              console.log(creatingLobby);
              switch (data.type) {
                case "StartGame":
                  if (!creatingLobby) {
                    await StartGame(data.matchNumber);
                    createLobby(data.matchNumber);

                    let logins = [
                      ...currentMatch.playersT1,
                      ...currentMatch.playersT2,
                    ];
                    for (let i = 0; i < logins.length; i++) {
                      for (var key in clients) {
                        if (logins[i].login == clients[key].login) {
                          console.log(clients[key].login);
                          clients[key].send(
                            JSON.stringify({
                              type: "LobbyUpdate",
                              Tab: 2,
                            })
                          );
                        }
                      }
                    }
                    for (let i = 0; i < logins.length; i++) {
                      for (var key in clients) {
                        if (logins[i].login == clients[key].login) {
                          console.log(clients[key].login);
                          clients[key].send(
                            JSON.stringify({
                              type: "LobbyUpdate2",
                              Tab: 2,
                            })
                          );
                        }
                      }
                    }
                  }
                  // let matchData = await StartGame(data);
                  // console.log(matchData);
                  // if (matchData.status == "OK") {
                  //   createLobby(matchData.matchNumber, matchData.users);
                  //   matches[matchData.matchNumber + ""] = matchData.users;
                  //   for (var key in clients) {
                  //     clients[key].send(
                  //       JSON.stringify({
                  //         type: "LobbyUpdate",
                  //         Tab: 2,
                  //       })
                  //     );
                  //   }
                  // }
                  break;
                default:
                  break;
              }
            });
          });
          Dota2.on("practiceLobbyUpdate", async function (lobby) {
            if (creatingLobby) {
              Dota2.on("chatMessage", function (channel, personaName, message) {
                console.log(
                  "[" + channel + "] " + personaName + ": " + message
                );
              });
              if (!areLobbySettingsAdd) {
                Dota2.configPracticeLobby(
                  lobby.lobby_id,
                  {
                    game_name: "Match#" + currentMatch.matchNumber,
                    server_region: 3,
                    game_mode: 1,
                    game_version: 1,
                    allow_cheats: true,
                    fill_with_bots: false,
                    allow_spectating: true,
                    pass_key: currentMatch.matchNumber + "",
                    radiant_series_wins: 0,
                    dire_series_wins: 0,
                    allchat: true,
                    leagueid: 12604,
                  },
                  () => {
                    console.log("Settings update");
                  }
                );
                areLobbySettingsAdd = true;
              }
              if (!isInLobbyChat) {
                Dota2.joinChat("Lobby_" + lobby.lobby_id, 3);
                isInLobbyChat = true;
              }

              let players = [
                ...currentMatch.playersT1,
                ...currentMatch.playersT2,
              ];
              for (let i = 0; i < players.length; i++) {
                let sendInvite = true;
                for (let ii = 0; ii < lobby.all_members.length; ii++) {
                  if (players[i].name == lobby.all_members[ii].name) {
                    sendInvite = false;
                  }
                }
                if (sendInvite) {
                  Dota2.inviteToLobby(players[i].id);
                }
              }
              // if(!isLobbyBalanced){
              //     Dota2.balancedShuffleLobby(()=>{console.log('Balanced')})
              //   }
              Dota2.on(
                "chatJoin",
                (channel, joiner_name, joiner_steam_id, otherJoined_object) => {
                  canCheckMatchStart = true;
                }
              );

              if (canCheckMatchStart) {
                let counter = 0;
                for (let i = 1; i < lobby.all_members.length; i++) {
                  console.log(
                    lobby.all_members[i].team === 0,
                    lobby.all_members[i].team === 1
                  );
                  if (
                    lobby.all_members[i].team === 0 ||
                    lobby.all_members[i].team === 1
                  ) {
                    counter += 1;
                    console.log(counter);
                  }
                }
                if (counter == 10) {
                  isLobbyFool = true;
                }
                if (isLobbyFool) {
                  console.log("full");
                  Dota2.sendMessage(
                    "Игра начнется через 5 секунд!.",
                    "Lobby_" + lobby.lobby_id,
                    3
                  );
                  if (currentMatch.gameType == "Solo") {
                    Dota2.balancedShuffleLobby(() => {
                      console.log("Balanced");
                    });
                    Dota2.sendMessage(
                      "Команды сбалансированы",
                      "Lobby_" + lobby.lobby_id,
                      3
                    );
                  } else {
                    setTimeout(function () {
                      Dota2.sendMessage(
                        "Командa сил света: ",
                        "Lobby_" + lobby.lobby_id,
                        3
                      );
                      for (let i = 0; i < currentMatch.playersT1.length; i++) {
                        Dota2.sendMessage(
                          "" + currentMatch.playersT1[i].name,
                          "Lobby_" + lobby.lobby_id,
                          3
                        );
                      }
                      Dota2.sendMessage(
                        "Командa сил тьмы: ",
                        "Lobby_" + lobby.lobby_id,
                        3
                      );
                      for (let i = 0; i < currentMatch.playersT1.length; i++) {
                        Dota2.sendMessage(
                          "" + currentMatch.playersT2[i].name,
                          "Lobby_" + lobby.lobby_id,
                          3
                        );
                      }
                    }, 1000);
                  }

                  setTimeout(function () {
                    creatingLobby = false;
                    Dota2.launchPracticeLobby(function (err, data) {});
                    Dota2.leavePracticeLobby();
                    isInLobbyChat = false;
                    canCheckMatchStart = false;
                    currentMatch = null;
                    isLobbyFool = false;
                    areLobbySettingsAdd = false;
                  }, 5000);
                }
              }
            }
            if (lobby.match_outcome != 0) {
              console.log("status", lobby.match_outcome);
              switch (lobby.match_outcome) {
                case 3: //Победа тьмы
                  console.log("Победа тьмы");
                  await SetMatchResult(
                    lobby.game_name.split("#")[1],
                    1,
                    lobby.all_members,
                    lobby.match_id,
                    clients
                  );
                  break;
                case 2: //Победа света
                  console.log("Победа света");
                  await SetMatchResult(
                    lobby.game_name.split("#")[1],
                    0,
                    lobby.all_members,
                    lobby.match_id,
                    clients
                  );
                  break;
              }
            }

            // lobby["members"].forEach(function (item, i, arr) {
            //   if (item.team == 1 || item.team == 0) {
            //     pn = i;
            //     console.log(pn);
            //   }
            // });
            // if (pn == 4) {
            //   var launch = 0;
            //   if (launch == 0) {
            //     Dota2.sendMessage(
            //       lobby.game_name,
            //       "Игра начнется через 5 секунд!."
            //     );
            //     setTimeout(function () {
            //       Dota2.launchPracticeLobby(function (err, data) {});
            //       launch = 1;
            //       Dota2.leavePracticeLobby();
            //     }, 5000);
            //   }
            // } else pn = 0;
          });
        });

        Dota2.on("unready", function onUnready() {
          console.log("Node-dota2 unready.");
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
    fs.writeFileSync("./sentry", sentry.bytes);
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
    var sentry = fs.readFileSync("./sentry");
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
