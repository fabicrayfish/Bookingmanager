var nodemailer = process.env.NODE_ENV === 'test' ? require('nodemailer-mock') : require("nodemailer");
var transportAddress = process.env.NODE_ENV === 'test' ? '' : 'smtps://admin%40alaskapirate.de:crayfish2013@smtp.strato.de';
var transporter = nodemailer.createTransport(transportAddress);

var EmailSender = function(){
  _sendEmailAsHTML = function (email, callback) {
    var mailOptions = {
        from: email.sender, // sender address
        to: email.recipient, // list of receivers
        subject: email.subject, // Subject line
        html: email.body // plaintext body
    };

    sendEmail(mailOptions, callback);
  }

  _sendEmailAsText = function (email, callback) {
    var mailOptions = {
        from: email.sender, // sender address
        to: email.recipient, // list of receivers
        bcc: email.bcc,
        subject: email.subject, // Subject line
        text: email.body // plaintext body
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
