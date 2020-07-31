const axios = require("axios");

async function a() {
  var d = await axios.get(
    "https://api.steampowered.com/IDOTA2Match_570/GetMatchDetails/V001/?account_id=360003335&match_id=5484525104&key=9CD31316A9A87B1AC88D3B22322194A3"
  );
  console.log(d);
}

a();
