const User = require("../../db/models/user");
const Match = require("../../db/models/match");
const Party = require("../../db/models/party");
const partyController = require("../../controller/partyController");
const user = require("../../db/models/user");

let SetReady = async (login) => {
  let user = await User.findOne({ login });
  user.ready = !user.ready;
  if (user.partyID) {
    let party = await Party.findOne({ _id: user.partyID });
    console.log(party);
    if (party) {
      party.players.forEach((el) => {
        if (el.login == login) el.ready = !el.ready;
      });
      await User.updateOne({ login }, { $set: user });
      await Party.updateOne({ _id: user.partyID }, { $set: party });
      return { players: party.players, partyID: user.partyID };
    }
  }
  await User.updateOne({ login }, { $set: user });
  return { players: [user.login], partyID: user.partyID };
};

let CickFromParty = async (login, cickLogin, partyID) => {
  let party = await Party.findOne({ _id: partyID });
  console.log(party);
  let user = await User.findOne({ login: cickLogin });
  if (party.creatorLogin == login) {
    party.players.forEach((el, index) => {
      if (el.login == cickLogin) {
        party.players.splice(index, 1);
      }
    });
    user.partyID = "";
    await User.updateOne({ login: cickLogin }, { $set: user });
    await Party.updateOne({ _id: partyID }, { $set: party });
    return party.players;
  } else return false;
};

let LeveParty = async (login, partyID) => {
  let party = await Party.findOne({ _id: partyID });
  let user = await User.findOne({ login });
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
  }

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
        ready: false,
      });
      friend.notifications.push({
        date: new Date(),
        login,
        message: "Приглашение в лобби",
        type: "AddTooParty",
        partyID: partyId,
      });
    }
    await User.updateOne({ login: friendLogin }, { $set: friend });
    await Party.updateOne({ _id: partyId }, { $set: party });
    return partyId;
  } else {
    party = new Party({
      creatorLogin: login,
      players: [
        { login, photo: user.photo, status: "inLobby", ready: user.ready },
        {
          login: friendLogin,
          photo: friend.photo,
          status: "waiting",
          ready: false,
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
    });
    user.partyID = newParty._id;
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
  });
  await User.updateOne({ login: friendLogin }, { $set: user2 });
};
let AcceptParty = async (login, friendLogin, partyID) => {
  let user = await User.findOne({ login });
  let friend = await User.findOne({ login: friendLogin });
  let party = await Party.findOne({ _id: partyID });

  party.players.forEach((el) => {
    if (el.login == login) {
      el.status = "inLobby";
      el.ready = user.ready;
    }
  });

  user.notifications.forEach((el, index) => {
    if (el.login == friendLogin && el.type == "AddTooParty")
      user.notifications.splice(index, 1);
  });
  user.partyID = partyID;
  await User.updateOne({ login }, { $set: user });

  friend.notifications.push({
    date: new Date(),
    login,
    message: "Приcоединился к лобби",
    type: "AcceptLobby",
  });

  await User.updateOne({ login: friendLogin }, { $set: friend });
  let a = await Party.updateOne({ _id: partyID }, { $set: party });
};
let notAcceptParty = async (login, friendLogin, partyID) => {
  let user = await User.findOne({ login });
  let friend = await User.findOne({ login: friendLogin });
  let party = await Party.findOne({ _id: partyID });
  party.players.forEach((el, index) => {
    if (el.login == login) party.players.splice(index, 1);
  });
  await Party.updateOne({ _id: partyID }, { $set: party });
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
                party: data.partyID,
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
                clients[key].login == data.cickLogin
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
      case "setReady":
        let ready = 0;
        let users = await SetReady(data.login);
        console.log(users);
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
        for (var key in clients) {
          users.players.forEach((el) => {
            if ((el.login = clients[key].login))
              clients[key].send(
                JSON.stringify({
                  type: "PartyUpdate",
                  party: users.partyID,
                })
              );
          });
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
    let login = clients[id].login;
    delete clients[id];
    let user = await User.findOne({ login });
    user.ready = false;
    await User.updateOne({ login }, { $set: user });
    if (user.partyID) {
      let party = await Party.findOne({ _id: user.partyID });
      if (party) {
        party.players.forEach((el) => {
          if (el.login == login) el.ready = false;
        });
        await Party.updateOne({ _id: user.partyID }, { $set: party });
        for (var key in clients) {
          party.players.forEach((el) => {
            if (el.login != login)
              clients[key].send(
                JSON.stringify({
                  type: "PartyUpdate",
                  party: user.partyID,
                })
              );
          });
        }
      }
    }
  });
};
