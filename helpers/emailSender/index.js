const nodemailer = require("nodemailer");

async function sendEmail(email) {
  var from = "Darevins Club <clubfordarv@gmail.com>";
  var date = Date.now();
  var message = `Чтобы поменять пароль перейдите по ссылке:\n https://dota2gamebot.herokuapp.com/recoweryPassword/${email}/${date}`;
  var to = email;
  var Transport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "clubfordarv@gmail.com",
      pass: "SunShine897",
    },
  });
  var mailOptions = {
    from: from,
    to: to,
    subject: "Востановление пароля",
    text: message,
  };
  Transport.sendMail(mailOptions, function (error, response) {
    if (error) {
      return "Что-то пошло не так";
    } else {
      return "Вам отправлено письмо для востановления пароля";
    }
  });
  return "Вам отправлено письмо для востановления пароля";
}

module.exports = sendEmail;
