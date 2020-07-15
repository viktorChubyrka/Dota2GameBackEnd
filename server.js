const http = require("http");
const config = require("./config");
const dbConnect = require("./db");

var clients = {};

(async () => {
  const app = require("./app");
  dbConnect.connect();

  const httpServer = http.createServer(app);

  const WebSocket = require("ws");

  const wss = new WebSocket.Server({ server: httpServer });

  wss.on("connection", function connection(ws) {
    var id = Math.random();
    clients[id] = ws;
    console.log("новое соединение " + id);
    ws.on("message", function (message) {
      let data = JSON.parse(message);
      console.log("получено сообщение " + data.message);

      for (var key in clients) {
        clients[key].send(
          JSON.stringify({ message: data.message, login: data.login })
        );
      }
    });
    ws.on("close", function () {
      console.log("соединение закрыто " + id);
      delete clients[id];
    });
  });

  httpServer.listen(config.PORT || 5000);
  console.log(`App listen ${config.PORT || 5000}`);
})();
