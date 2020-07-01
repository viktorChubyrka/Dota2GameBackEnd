const http = require("http");

const config = require("./config");
const dbConnect = require("./db");

(async () => {
  const app = require("./app");
  dbConnect.connect();

  const httpServer = http.createServer(app);

  httpServer.listen(config.PORT || 5000);
  console.log(`App listen ${config.PORT || 5000}`);
})();
