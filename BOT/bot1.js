var steam = require("steam"),
  util = require("util"),
  fs = require("fs"),
  crypto = require("crypto"),
  dota2 = require("dota2"),
  steamClient = new steam.SteamClient(),
  steamUser = new steam.SteamUser(steamClient),
  steamFriends = new steam.SteamFriends(steamClient),
  Dota2 = new dota2.Dota2Client(steamClient, true);

var t1, t2, gamemode, pass;
global.config = require("./configs/config1");

var users = [];
var lobbygame;
var ready = 0;

module.exports = () => {
  function createLobby() {
    /*Конфиг лобби*/
    pass = Math.floor(Math.random() * 99999 + 1);
    pass = pass + "_" + lobbygame;
    var options = {
      game_name: "Игра #" + lobbygame,
      server_region: 3,
      game_mode: gamemode,
      game_version: 1,
      allow_cheats: true,
      fill_with_bots: false,
      allow_spectating: true,
      pass_key: pass,
      radiant_series_wins: 0,
      dire_series_wins: 0,
      allchat: false,
    };
    /*Конец конфига*/

    Dota2.createPracticeLobby(options.pass_key, options, function (err, data) {
      if (JSON.stringify(data["result"]) == 1) {
        util.log("Лобби успешно создано");
      } else {
        util.log("Создать лобби не удалсоь");
      }
    });

    Dota2.joinPracticeLobbyTeam(1, 4, function (err, data) {
      if (JSON.stringify(data["result"]) == 1) {
        util.log("Бот занял место наблюдателя.");
      }
    });
    /*Invites*/
    setInterval(function () {
      if (ready == 1) {
        users.forEach(function (item, i, arr) {
          Dota2.inviteToLobby(item);
        });
        ready = 0;
      }
    }, 5000);
  }

  var onSteamLogOn = function onSteamLogOn(logonResp) {
      if (logonResp.eresult == steam.EResult.OK) {
        steamFriends.setPersonaState(steam.EPersonaState.Busy);
        steamFriends.setPersonaName("cGame.info|BOT #");
        util.log("Авторизован.");
        Dota2.launch();
        Dota2.on("ready", function () {
          var date = new Date();

          util.log("Бот готов.");
          /*Создаем лобби*/
          createLobby();
          /*Лобии создано*/
          Dota2.on("practiceLobbyUpdate", function (lobby) {
            id = lobby.lobby_id + "";
            var status = lobby.match_outcome;
            var chat = 0;
            if (chat == 0) {
              Dota2.joinChat("Lobby_" + id, 3);
            }
            if (status != 0) {
              connection.query(
                "UPDATE ladder_lobbies_games SET lobby_g_result= " +
                  status +
                  " WHERE lobby_g_id = " +
                  lobbygame
              );
              switch (status) {
                case 1: //Победа тьмы
                  connection.query(
                    "UPDATE ladder_lobbies_games SET lobby_g_winner= " +
                      t1 +
                      " WHERE lobby_g_id = " +
                      lobbygame
                  );
                  break;
                case 2: //Победа света
                  connection.query(
                    "UPDATE ladder_lobbies_games SET lobby_g_winner= " +
                      t2 +
                      " WHERE lobby_g_id = " +
                      lobbygame
                  );
                  break;
              }
              FreeBot();
            }
            var pn;
            var pnn = 0;
            lobby["members"].forEach(function (item, i, arr) {
              pn = i + 1;
            });
            if (pn == 3) {
              var laucnh = 0;
              if ((launch = 0)) {
                Dota2.sendMessage(
                  "Lobby_" + id,
                  "Игра начнется через 5 секунд!."
                );
                setTimeout(function () {
                  Dota2.launchPracticeLobby(function (err, data) {});
                  laucnh = 1;
                  steamFriends.sendMessage(
                    "76561198107070247",
                    "Игра #" + id + " была начата!",
                    steam.EChatEntryType.ChatMsg
                  );
                }, 5000);
              }
            }
          });
        });

        Dota2.on("unready", function onUnready() {
          util.log("Node-dota2 unready.");
        });

        Dota2.on("chatMessage", function (channel, personaName, message) {
          chat.trace("[" + channel + "] " + personaName + ": " + message);
        });

        Dota2.on("unhandled", function (kMsg) {
          util.log("UNHANDLED MESSAGE #" + kMsg);
        });
      }
    },
    onSteamServers = function onSteamServers(servers) {
      util.log("Received servers.");
      fs.writeFile("servers", JSON.stringify(servers), () => {});
    },
    onSteamLogOff = function onSteamLogOff(eresult) {
      util.log("Logged off from Steam.");
    },
    onSteamError = function onSteamError(error) {
      util.log("Connection closed by server.");
    };
  steamFriends.on("message", function (source, message, type, chatter) {
    // respond to both chat room and private messages

    console.log("Получено сообщение: " + message);

    switch (message) {
      case "Покинуть":
        Dota2.abandonCurrentGame();
        Dota2.leavePracticeLobby();
        Dota2.leaveChat("Lobby_" + id);
        steamFriends.sendMessage(
          source,
          "Покинул лобби #" + id,
          steam.EChatEntryType.ChatMsg
        );
        id = null;
        break;
      case "Статус":
        if (id != null) {
          var answer = "Нахожусь в лобби #" + id + ". Пароль от лобби: " + pass;
          steamFriends.sendMessage(
            source,
            answer,
            steam.EChatEntryType.ChatMsg
          );
        } else {
          steamFriends.sendMessage(
            source,
            "Ожидаю игру.",
            steam.EChatEntryType.ChatMsg
          );
        }
        break;
      case "Создать":
        createLobby();
        break;
      case "Пригласить админов":
        Dota2.inviteToLobby("76561198107070247");
        steamFriends.sendMessage(
          source,
          "Приглашение для админов было отправленно!" + source,
          steam.EChatEntryType.ChatMsg
        );
        break;
      case "Офф":
        Dota2.abandonCurrentGame();
        Dota2.leavePracticeLobby();
        Dota2.leaveChat("Lobby_" + id);
        Dota2.exit();
        steamClient.disconnect();
        FreeBot();
        break;
      case "Начать игру":
        Dota2.launchPracticeLobby(function (err, data) {});
        var answer = "Игра #" + id + " была начата!";
        steamFriends.sendMessage(source, answer, steam.EChatEntryType.ChatMsg);
        break;
      case "Кикнуть":
        Dota2.practiceLobbyKickFromTeam(Dota2.ToAccountID("76561198107070247"));
        steamFriends.sendMessage(
          source,
          "Игрок кикнут",
          steam.EChatEntryType.ChatMsg
        );
        break;
    }
  });
  steamUser.on("updateMachineAuth", function (sentry, callback) {
    fs.writeFileSync("sentry", sentry.bytes);
    util.log("sentryfile saved");

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
    util.log("Cannot load the sentry. " + beef);
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
