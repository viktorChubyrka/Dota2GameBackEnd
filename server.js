const http = require("http");

const config = require("./config");
const dbConnect = require("./db");

(async () => {
  const app = require("./app");
  dbConnect.func();

  const httpServer = http.createServer(app);

  httpServer.listen(config.PORT, config.HOST);
  console.log(`App listen ${config.PORT}`);
})();
