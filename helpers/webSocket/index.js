const User = require("../../db/models/user");
const Match = require("../../db/models/match");
const Party = require("../../db/models/party");
const partyController = require("../../controller/partyController");

let setUserActive = async (login) => {
  let user = await User.findOne({ login });
  user.ready = !user.ready;
  if (user.partyID) {
    let party = await Party.findOne({ _id: user.partyID });
    party.players.forEach((el) => {
      if (el.login == login) el.ready = !el.ready;
    });
    await Party.updateOne({ _id: user.partyID }, { $set: party });
    await User.updateOne({ login }, { $set: user });
    return party._id;
  }
  await User.updateOne({ login }, { $set: user });
  return "";
};

let SearchPartyGame = async (login) => {
  let matchesNotFiltered = await Match.find();
  let user = await User.findOne({ login });
  let matches = matchesNotFiltered.filter(
    (match) => match.gameType == "Party" && match.status == "upcoming"
  );
  if (matches[0]) {
    party = new Party({
      creatorLogin: login,
      players: [{ login, photo: user.photo, status: "inLobby", ready: true }],
    });
    let newParty = await party.save();
    user.partyID = newParty._id;
    user.ready = true;
    if (matches[0].playersT1) {
      newParty.players.forEach((el) => {
        matches[0].playersT2.push(el.login);
      });
    }
    if (matches[0].playersT2) {
      newParty.players.forEach((el) => {
        matches[0].playersT1.push(el.login);
      });
    }
    await Match.updateOne({ _id: matches[0]._id }, { $set: matches[0] });
    await User.updateOne({ login }, { $set: user });
    return [...matches[0].playersT1, ...matches[0].playersT2];
  } else {
    party = new Party({
      creatorLogin: login,
      players: [{ login, photo: user.photo, status: "inLobby", ready: true }],
    });
    let newParty = await party.save();
    user.partyID = newParty._id;
    user.ready = true;
    let matchNumber = "";
    for (let i = 0; i < 10; i++) {
      matchNumber = matchNumber + Math.floor(Math.random() * Math.floor(10));
    }
    let newMatch = new Match({
      creatorLogin: login,
      playersT1: [login],
      creationDate: new Date(),
      matchNumber,
      gameType: "Party",
      status: "upcoming",
    });
    let a = await newMatch.save();
    return [...newMatch.playersT1, ...newMatch.playersT2];
  }
};

let Deletenotification = async (login, date) => {
  let user = await User.findOne({ login });
  let date1 = new Date(date);
  let date2;
  user.notifications.forEach((el, index) => {
    date2 = new Date(el.date);
    if (date1.getTime() - date2.getTime() == 0)
      user.notifications.splice(index, 1);
  });
  await User.updateOne({ login }, { $set: user });
};

let CickFromParty = async (login, cickLogin, partyID) => {
  let party = await Party.findOne({ creatorLogin: login });
  let user = await User.findOne({ login: cickLogin });
  let creatorUser = await User.findOne({ login });
  user.ready = false;
  if (party) {
    console.log(1);
    if (party.creatorLogin == login) {
      console.log(2);
      party.players.forEach((el, index) => {
        if (el.login == cickLogin) {
          party.players.splice(index, 1);
        }
      });
      if (party.players.length < 2) {
        creatorUser.partyID = "";
        await Party.deleteOne({ creatorLogin: login });
        user.partyID = "";
        creatorUser.ready = false;
        await User.updateOne({ login: cickLogin }, { $set: user });
        await User.updateOne({ login }, { $set: creatorUser });
        return [];
      } else {
        console.log(4);
        user.partyID = "";
        await Party.updateOne({ creatorLogin: login }, { $set: party });
      }
      await User.updateOne({ login: cickLogin }, { $set: user });
      await User.updateOne({ login }, { $set: creatorUser });

      return party.players;
    } else return [];
  } else return [];
};

let LeveParty = async (login, partyID) => {
  let party = await Party.findOne({ _id: partyID });
  let user = await User.findOne({ login });
  user.ready = false;
  user.partyID = "";
  party.players.forEach((el, index) => {
    if (el.login == login) party.players.splice(index, 1);
  });
  let deleted = false;
  if (party.players.length == 0) {
    await Party.deleteOne({ _id: partyID });
    deleted = true;
  } else if (party.creatorLogin == login) party.creatorLogin = party.players[0];
  if (!deleted) await Party.updateOne({ _id: partyID }, { $set: party });
  await User.updateOne({ login }, { user });
  return party.players;
};
let enterLobby = async (matchNumber, login) => {
  let AllMatches = await Match.find();
  let isInMatch = false;
  AllMatches.forEach((el) => {
    if (el.playersT1.includes(login) || el.playersT2.includes(login)) {
      isInMatch = true;
    }
  });

  if (!isInMatch) {
    let match = await Match.findOne({ matchNumber });
    if (match.playersT1.length < 5) match.playersT1.push(login);
    else if (match.playersT2.length < 5) match.playersT2.push(login);
    await Match.updateOne({ matchNumber }, { $set: match });
  }
  let user = await User.findOne({ login });
  user.ready = true;
  await User.updateOne({ login }, { $set: user });
};

let leaveFromLobby = async (matchNumber, login) => {
  let user = await User.findOne({ login });
  let matchToLeave = await Match.findOne({ matchNumber });
  if ([...matchToLeave.playersT1, ...matchToLeave.playersT2].length == 1) {
    await Match.deleteOne({ matchNumber });
    user.ready = false;
    await User.updateOne({ login }, { $set: user });
  } else {
    let index = 0;
    if (matchToLeave.playersT1.includes(login)) {
      index = matchToLeave.playersT1.indexOf(login);
      matchToLeave.playersT1.splice(index, 1);
    } else {
      index = matchToLeave.playersT2.indexOf(login);
      matchToLeave.playersT2.splice(index, 1);
    }
    await Match.updateOne({ matchNumber }, { $set: matchToLeave });

    user.ready = false;
    await User.updateOne({ login }, { $set: user });
  }
};

let destroyLobby = async (creatorLogin) => {
  let lobbyToDelete = await Match.findOne({ creatorLogin });
  await Match.deleteOne({ creatorLogin });
  let users = [];
  let logins = [];
  if (lobbyToDelete)
    logins = [...lobbyToDelete.playersT2, ...lobbyToDelete.playersT1];
  for (let i = 0; i < logins.length; i++) {
    let user = await User.findOne({ login: logins[i] });
    user.ready = false;
    el.notifications.push({
      date: new Date(),
      message: "Лобби розпущено",
      type: "LobbyDestroed",
      new: true,
    });
    await User.updateOne({ login: login[i] }, { $set: user });
    users.push(user);
  }
  return logins;
};

let addToLobby = async (login) => {
  let matches = await Match.find();
  let playerCount = 0;
  let matchIndex = 0;
  let teamNumber = 0;
  let matchNumber = "";
  let allReadyInLobby = false;
  matches.forEach((el, index) => {
    if (!el.playersT2.includes(login) && !el.playersT1.includes(login)) {
      if (el.status == "upcoming") {
        if (
          el.playersT1.length + el.playersT2.length > playerCount &&
          el.playersT1.length + el.playersT2.length < 10
        ) {
          playerCount = el.playersT1.length + el.playersT2.length;
          match = index;
          if (
            el.playersT1.length > el.playersT2.length &&
            el.playersT1.length < 5
          ) {
            teamNumber = 0;
            matchNumber = el.matchNumber;
          } else {
            teamNumber = 1;
            matchNumber = el.matchNumber;
          }
        }
      }
    } else allReadyInLobby = true;
  });
  if (!allReadyInLobby) {
    if (playerCount) {
      if (teamNumber) matches[matchIndex].playersT2.push(login);
      else matches[matchIndex].playersT1.push(login);
      await Match.updateOne({ matchNumber }, { $set: matches[matchIndex] });
    } else {
      let matchNumber = "";
      for (let i = 0; i < 10; i++) {
        matchNumber = matchNumber + Math.floor(Math.random() * Math.floor(10));
      }
      let newMatch = new Match({
        creatorLogin: login,
        playersT1: [login],
        creationDate: new Date(),
        matchNumber,
        gameType: "Solo",
        status: "upcoming",
      });
      let a = await newMatch.save();
    }
  }
  let user = await User.findOne({ login });
  user.ready = true;
  await User.updateOne({ login }, { $set: user });
};
let AddPartyNotification = async (login, friendLogin, partyId) => {
  let party;
  if (partyId) party = await Party.findOne({ _id: partyId });
  let user = await User.findOne({ login });
  let friend = await User.findOne({ login: friendLogin });
  if (party) {
    let allreadyInParty = false;
    party.players.forEach((el) => {
      if (el.login == friendLogin) allreadyInParty = true;
    });

    if (!allreadyInParty && party.players.length < 5) {
      party.players.push({
        login: friend.login,
        photo: friend.photo,
        status: "waiting",
        ready: true,
      });
      friend.notifications.push({
        date: new Date(),
        login,
        message: "Приглашение в лобби",
        type: "AddTooParty",
        partyID: partyId,
        new: true,
      });
    }
    await User.updateOne({ login: friendLogin }, { $set: friend });
    await Party.updateOne({ _id: partyId }, { $set: party });
    return partyId;
  } else {
    party = new Party({
      creatorLogin: login,
      players: [
        { login, photo: user.photo, status: "inLobby", ready: true },
        {
          login: friendLogin,
          photo: friend.photo,
          status: "waiting",
          ready: true,
        },
      ],
    });
    let newParty = await party.save();
    friend.notifications.push({
      date: new Date(),
      login,
      message: "Приглашение в лобби",
      type: "AddTooParty",
      partyID: newParty._id,
      new: true,
    });
    user.partyID = newParty._id;
    user.ready = true;
    await User.updateOne({ login: friendLogin }, { $set: friend });
    await User.updateOne({ login }, { $set: user });
    let partyID = newParty._id;
    return partyID;
  }
};
let AddFriendNotification = async (login, userTooAdd) => {
  let userTooAddFriend = await User.findOne({ login: userTooAdd });
  let allReadyNotificated = false;
  userTooAddFriend.notifications.forEach((el) => {
    if (el.login == login && el.type == "AddTooFriends")
      allReadyNotificated = true;
  });
  if (!allReadyNotificated)
    userTooAddFriend.notifications.push({
      date: new Date(),
      login,
      type: "AddTooFriends",
      new: true,
    });
  await User.updateOne({ login: userTooAdd }, { $set: userTooAddFriend });
};
let AcceptFriend = async (login, friendLogin) => {
  let user1 = await User.findOne({ login });
  let user2 = await User.findOne({ login: friendLogin });
  let isInFrends = false;
  user1.friends.forEach((el) => {
    if (el == friendLogin) isInFrends = true;
  });
  if (!isInFrends) user1.friends.push(friendLogin);
  user1.notifications.forEach((el, index) => {
    if (el.login == friendLogin && el.type == "AddTooFriends")
      user1.notifications.splice(index, 1);
  });
  await User.updateOne({ login }, { $set: user1 });
  user2.friends.forEach((el) => {
    if (el == login) isInFrends = true;
  });
  if (!isInFrends) user2.friends.push(login);
  user2.notifications.push({
    date: new Date(),
    login,
    message: "Принял заявку в друзья",
    type: "AcceptFriend",
    new: true,
  });

  await User.updateOne({ login: friendLogin }, { $set: user2 });
};
let notAcceptFriend = async (login, friendLogin) => {
  let user1 = await User.findOne({ login });
  let user2 = await User.findOne({ login: friendLogin });
  user1.notifications.forEach((el, index) => {
    if (el.login == friendLogin && el.type == "AddTooFriends")
      user1.notifications.splice(index, 1);
  });

  await User.updateOne({ login }, { $set: user1 });
  user2.notifications.push({
    date: new Date(),
    login,
    message: "Отклонил заявку в друзья",
    type: "notAcceptFriend",
    new: true,
  });
  await User.updateOne({ login: friendLogin }, { $set: user2 });
};
let AcceptParty = async (login, friendLogin, partyID) => {
  let user = await User.findOne({ login });
  let friend = await User.findOne({ login: friendLogin });
  let party = await Party.findOne({ _id: partyID });

  party.players.forEach((el) => {
    if (el.login == login || el.login == friendLogin) {
      el.status = "inLobby";
      el.ready = true;
    }
  });

  user.notifications.forEach((el, index) => {
    if (el.login == friendLogin && el.type == "AddTooParty")
      user.notifications.splice(index, 1);
  });
  user.partyID = partyID;
  user.ready = true;
  await User.updateOne({ login }, { $set: user });
  friend.ready = true;
  friend.notifications.push({
    date: new Date(),
    login,
    message: "Приcоединился к лобби",
    type: "AcceptLobby",
    new: true,
  });

  await User.updateOne({ login: friendLogin }, { $set: friend });
  await Party.updateOne({ _id: partyID }, { $set: party });
};
let notAcceptParty = async (login, friendLogin, partyID) => {
  let user = await User.findOne({ login });
  let friend = await User.findOne({ login: friendLogin });
  let party = await Party.findOne({ _id: partyID });
  party.players.forEach((el, index) => {
    if (el.login == login) party.players.splice(index, 1);
  });
  if (party.players.length < 2) {
    await Party.deleteOne({ _id: partyID });
    friend.ready = false;
    friend.partyID = "";
  } else await Party.updateOne({ _id: partyID }, { $set: party });
  user.notifications.forEach((el, index) => {
    if (el.login == friendLogin && el.type == "AddTooParty")
      user.notifications.splice(index, 1);
  });
  await User.updateOne({ login }, { $set: user });
  friend.notifications.push({
    date: new Date(),
    login,
    message: "Пати отклонено от",
    type: "notAcceptParty",
    new: true,
  });
  await User.updateOne({ login: friendLogin }, { $set: friend });
};
var clients = {};
module.exports = async (ws) => {
  var id = Math.random();
  clients[id] = ws;
  console.log("новое соединение " + id);
  await ws.on("message", async function (message) {
    let data = JSON.parse(message);
    switch (data.type) {
      case "SetActive":
        let partyID = await setUserActive(data.login);
        for (var key in clients) {
          clients[key].send(
            JSON.stringify({
              type: "ReadyUpdate",
              partyID,
            })
          );
        }
        break;
      case "SearchPartyGame":
        console.log("sdsad");
        let playersParty = await SearchPartyGame(data.login);
        playersParty.forEach((el) => {
          for (var key in clients) {
            if (clients[key].login == el.login)
              clients[key].send(
                JSON.stringify({
                  type: "LobbyUpdate",
                })
              );
          }
        });

        break;
      case "DeleteNotification":
        await Deletenotification(data.login, data.date);
        for (var key in clients) {
          if (clients[key].login == data.login)
            clients[key].send(
              JSON.stringify({
                type: "NotificationUpdate",
              })
            );
        }
        break;
      case "AddToParty":
        let IDparty = await AddPartyNotification(
          data.login,
          data.friendLogin,
          data.lobby
        );

        for (var key in clients) {
          if (clients[key].login == data.login)
            clients[key].send(
              JSON.stringify({
                type: "PartyUpdate",
                party: IDparty,
              })
            );
          if (clients[key].login == data.friendLogin)
            clients[key].send(
              JSON.stringify({
                type: "PartyUpdate",
                party: "",
              })
            );
        }
        break;
      case "AcceptParty":
        await AcceptParty(data.login, data.friendLogin, data.partyID);
        for (var key in clients) {
          if (
            clients[key].login == data.login ||
            clients[key].login == data.friendLogin
          )
            clients[key].send(
              JSON.stringify({
                type: "PartyUpdate",
                party: data.partyID,
              })
            );
        }
        break;
      case "notAcceptParty":
        await notAcceptParty(data.login, data.friendLogin, data.partyID);
        for (var key in clients) {
          if (
            clients[key].login == data.login ||
            clients[key].login == data.friendLogin
          )
            clients[key].send(
              JSON.stringify({
                type: "PartyUpdate",
              })
            );
        }
        break;
      case "LeveParty":
        let players = await LeveParty(data.login, data.partyID);
        for (var key in clients) {
          players.forEach((el) => {
            if (
              clients[key].login == el.login ||
              clients[key].login == data.login
            )
              clients[key].send(
                JSON.stringify({
                  type: "PartyUpdate",
                  party: data.partyID,
                })
              );
          });
        }
        break;
      case "CickPlayer":
        let players2 = await CickFromParty(
          data.login,
          data.cickLogin,
          data.partyID
        );
        if (players2)
          for (var key in clients) {
            players2.forEach((el) => {
              if (
                clients[key].login == el.login ||
                clients[key].login == data.cickLogin ||
                clients[key].login == data.login
              )
                clients[key].send(
                  JSON.stringify({
                    type: "PartyUpdate",
                    party: data.partyID,
                  })
                );
            });
            if (
              clients[key].login == data.login ||
              clients[key].login == data.cickLogin
            )
              clients[key].send(
                JSON.stringify({
                  type: "PartyUpdate",
                  party: "",
                })
              );
          }
        break;
      case "EnterLobby":
        await enterLobby(data.matchNumber, data.login);
        for (var key in clients) {
          if (clients[key].login == data.login)
            clients[key].send(
              JSON.stringify({
                type: "LobbyUpdate",
                Tab: 3,
              })
            );
          clients[key].send(
            JSON.stringify({
              type: "LobbyUpdate",
            })
          );
        }
        break;
      case "LeaveLobby":
        await leaveFromLobby(data.matchNumber, data.login);
        for (var key in clients) {
          if (clients[key].login == data.login)
            clients[key].send(
              JSON.stringify({
                type: "LobbyUpdate",
                Tab: 2,
              })
            );
          clients[key].send(
            JSON.stringify({
              type: "LobbyUpdate",
            })
          );
        }
        break;
      case "DestroyLobby":
        let logins = await destroyLobby(data.login);
        for (let i = 0; i < logins.length; i++) {
          for (var key in clients) {
            if (logins[i] == clients[key].login)
              clients[key].send(
                JSON.stringify({
                  type: "LobbyDestroyed",
                  Tab: 2,
                })
              );
          }
        }
        for (var key in clients) {
          clients[key].send(
            JSON.stringify({
              type: "LobbyUpdate",
            })
          );
        }
        break;
      case "SearchGame":
        await addToLobby(data.login);
        for (var key in clients) {
          if (clients[key].login == data.login)
            clients[key].send(
              JSON.stringify({
                type: "LobbyUpdate",
                Tab: 3,
              })
            );
          else
            clients[key].send(
              JSON.stringify({
                type: "LobbyUpdate",
              })
            );
        }
        break;
      case "join":
        clients[id].login = data.data;
        clients[id].ready = false;
        var readyOnStart = 0;
        let online = 0;
        for (var key in clients) {
          online += 1;
          if (clients[key].ready) readyOnStart += 1;
        }
        for (var key in clients) {
          clients[key].send(
            JSON.stringify({
              type: "online",
              online,
            })
          );
        }
        break;
      case "AddFriend":
        await AddFriendNotification(data.login, data.userToAdd);
        for (var key in clients) {
          if (clients[key].login == data.userToAdd)
            clients[key].send(
              JSON.stringify({
                type: "AddFriend",
              })
            );
        }
        break;
      case "AcceptFriend":
        await AcceptFriend(data.login, data.friendLogin);
        for (var key in clients) {
          if (
            clients[key].login == data.friendLogin ||
            clients[key].login == data.login
          )
            clients[key].send(
              JSON.stringify({
                type: "AcceptFriend",
              })
            );
        }
        break;
      case "notAcceptFriend":
        await notAcceptFriend(data.login, data.friendLogin);
        for (var key in clients) {
          if (
            clients[key].login == data.friendLogin ||
            clients[key].login == data.login
          )
            clients[key].send(
              JSON.stringify({
                type: "notAcceptFriend",
              })
            );
        }
        break;
      default:
        for (var key in clients) {
          clients[key].send(
            JSON.stringify({
              type: "Chat",
              message: data.message,
              login: data.login,
            })
          );
        }
        break;
    }
  });
  ws.on("close", async function () {
    console.log("соединение закрыто " + id);
    delete clients[id];
  });
};
