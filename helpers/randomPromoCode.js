const randomPromoCode = () => {
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  var promo = "";
  for (let i = 0; i < 10; i++) {
    promo += characters.charAt(Math.random() * charactersLength);
  }
  return promo;
};

module.exports = randomPromoCode;
