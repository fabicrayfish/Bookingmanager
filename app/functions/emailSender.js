var nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport('smtps://admin%40alaskapirate.de:crayfish2013@smtp.strato.de');

var EmailSender = function(){
  _sendEmailAsHTML = function (sender, recipient, subject, body, callback) {
    var mailOptions = {
        from: sender, // sender address
        to: recipient, // list of receivers
        subject: subject, // Subject line
        html: body // plaintext body
    };

    sendEmail(mailOptions, callback);
  }

  _sendEmailAsText = function (sender, recipient, bcc, subject, body, callback) {
    var mailOptions = {
        from: sender, // sender address
        to: recipient, // list of receivers
        bcc: bcc,
        subject: subject, // Subject line
        text: body // plaintext body
    };

    sendEmail(mailOptions, callback);
  }

  sendEmail = function(mailOptions, callback) {
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(err, info){
      callback(err, info);
    });
  }
  return {
    sendEmailAsHTML   : _sendEmailAsHTML,
    sendEmailAsText   : _sendEmailAsText
  }
}();

module.exports = EmailSender;
