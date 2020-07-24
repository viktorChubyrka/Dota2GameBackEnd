const User = require("../../db/models/user");
const Match = require("../../db/models/match");
const Party = require("../../db/models/party");
const partyController = require("../../controller/partyController");
const { log } = require("winston");

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
};

let leaveFromLobby = async (matchNumber, login) => {
  let matchToLeave = await Match.findOne({ matchNumber });
  if ([...matchToLeave.playersT1, ...matchToLeave.playersT2].length == 1) {
    await Match.deleteOne({ matchNumber });
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
  }
};

let destroyLobby = async (creatorLogin) => {
  let lobbyToDelete = await Match.findOne({ creatorLogin });
  await Match.deleteOne({ creatorLogin });
  let users = [];
  let logins = [...lobbyToDelete.playersT2, ...lobbyToDelete.playersT1];
  for (let i = 0; i < logins.length; i++) {
    let user = await User.findOne({ login: logins[i] });
    users.push(user);
    console.log(user);
  }
  console.log(users, "asdsa");
  users.forEach(async (el) => {
    el.notifications.push({
      date: new Date(),
      message: "Лобби розпущено",
      type: "LobbyDestroed",
    });
    await User.updateOne({ login: el.login }, { $set: el });
  });
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
};
let AddPartyNotification = async (login, friendLogin, partyId) => {
  let party;
  if (partyId) party = await Party.findOne({ _id: partyId });
  let user = await User.findOne({ login });
  let friend = await User.findOne({ login: friendLogin });
  console.log(party);
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
      });
      friend.notifications.push({
        date: new Date(),
        login,
        message: "Приглашение в лобби",
        type: "AddTooParty",
      });
    }
    await Party.updateOne({ _id: partyId }, { $set: party });
  } else {
    party = new Party({
      creatorLogin: login,
      players: [
        { login, photo: user.photo, status: "inLobby" },
        { login: friendLogin, photo: friend.photo, status: "waiting" },
      ],
    });
    let newParty = await party.save();
    friend.notifications.push({
      date: new Date(),
      login,
      message: "Приглашение в лобби",
      type: "AddTooParty",
    });

    user.partyID = newParty._id;
  }
  await User.updateOne({ login: friendLogin }, { $set: friend });
  await User.updateOne({ login }, { $set: user });
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
  });
  console.log(user2);
  await User.updateOne({ login: friendLogin }, { $set: user2 });
};
let notAcceptFriend = async (login, friendLogin) => {
  let user1 = await User.findOne({ login });
  let user2 = await User.findOne({ login: friendLogin });
  user1.notifications.forEach((el, index) => {
    console.log(el.login == friendLogin && el.type == "AddTooFriends");
    if (el.login == friendLogin && el.type == "AddTooFriends")
      user1.notifications.splice(index, 1);
  });

  await User.updateOne({ login }, { $set: user1 });
  user2.notifications.push({
    date: new Date(),
    login,
    message: "Отклонил заявку в друзья",
    type: "notAcceptFriend",
  });
  await User.updateOne({ login: friendLogin }, { $set: user2 });
};
let AcceptParty = async (login, friendLogin) => {
  let user2 = await User.findOne({ login });
  let user1 = await User.findOne({ login: friendLogin });
  let party = await Party.findOne({ creatorLogin: friendLogin });
  let isInParty = false;
  if (party) {
    party.players.forEach((el) => {
      if (el.login == friendLogin) isInParty = true;
    });
    if (!isInParty)
      if (party.players.length < 5) party.players.push(friendLogin);
  } else {
    party = new Party({
      creatorLogin: friendLogin,
      players: [
        { login, ready: false },
        { login: friendLogin, ready: false },
      ],
    });
    console.log(party);
    await party.save();
  }
  user2.notifications.forEach((el, index) => {
    if (el.login == friendLogin && el.type == "AddTooParty")
      user2.notifications.splice(index, 1);
  });
  await User.updateOne({ login }, { $set: user2 });

  user1.notifications.push({
    date: new Date(),
    login,
    message: "Приcоединился к лобби",
    type: "AcceptLobby",
  });

  await User.updateOne({ login: friendLogin }, { $set: user1 });
};
let notAcceptParty = async (login, friendLogin) => {
  let user1 = await User.findOne({ login });
  let user2 = await User.findOne({ login: friendLogin });
  user2.notifications.forEach((el, index) => {
    if (el.login == friendLogin && el.type == "AddTooParty")
      user1.notifications.splice(index, 1);
  });
  await User.updateOne({ friendLogin }, { $set: user2 });
  user1.notifications.push({
    date: new Date(),
    login,
    message: "Приглашение в пати",
    type: "notAcceptFriend",
  });
  await User.updateOne({ login: login }, { $set: user1 });
};
var clients = {};
module.exports = async (ws) => {
  var id = Math.random();
  clients[id] = ws;
  console.log("новое соединение " + id);
  ws.on("message", function (message) {
    let data = JSON.parse(message);
    switch (data.type) {
      case "AddToParty":
        AddPartyNotification(data.login, data.friendLogin, data.lobby);
        for (var key in clients) {
          if (
            clients[key].login == data.friendLogin ||
            clients[key].login == data.login
          )
            clients[key].send(
              JSON.stringify({
                type: "PartyUpdate",
              })
            );
        }
        break;
      case "AcceptParty":
        AcceptParty(data.login, data.friendLogin);
        for (var key in clients) {
          if (
            clients[key].login == data.friendLogin ||
            clients[key].login == data.login
          )
            clients[key].send(
              JSON.stringify({
                type: "AcceptParty",
              })
            );
        }
        break;
      case "notAcceptParty":
        notAcceptParty(data.login, data.friendLogin);
        for (var key in clients) {
          if (
            clients[key].login == data.friendLogin ||
            clients[key].login == data.login
          )
            clients[key].send(
              JSON.stringify({
                type: "notAcceptParty",
              })
            );
        }
        break;
      case "EnterLobby":
        enterLobby(data.matchNumber, data.login);
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
        leaveFromLobby(data.matchNumber, data.login);
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
        console.log(data.login);
        let logins = destroyLobby(data.login);
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
        addToLobby(data.login);
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
              ready: readyOnStart,
            })
          );
        }
        break;
      case "AddFriend":
        console.log("sdsa");
        AddFriendNotification(data.login, data.userToAdd);
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
        AcceptFriend(data.login, data.friendLogin);
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
        notAcceptFriend(data.login, data.friendLogin);
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
      case "setReady":
        let ready = 0;
        for (var key in clients) {
          if (clients[key].login == data.login)
            clients[key].ready = !clients[key].ready;
          if (clients[key].ready) ready += 1;
        }
        for (var key in clients) {
          clients[key].send(
            JSON.stringify({
              type: "ready",
              ready,
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
  ws.on("close", function () {
    console.log("соединение закрыто " + id);
    delete clients[id];
  });
};
