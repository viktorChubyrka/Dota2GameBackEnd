const http = require("http");
const config = require("./config");
const dbConnect = require("./db");
const webSocket = require("./helpers/webSocket");

(async () => {
  const app = require("./app");
  dbConnect.connect();

  const httpServer = http.createServer(app);

  const WebSocket = require("ws");

  const wss = new WebSocket.Server({ server: httpServer });

  wss.on("connection", function connection(ws) {
    webSocket(ws);
  });

  httpServer.listen(config.PORT || 5000);
  console.log(`App listen ${config.PORT || 5000}`);
})();
