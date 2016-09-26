// Testmail
var mongoose = require('mongoose');
var moment = require('moment');
var nodemailer = require("nodemailer");
var schedule = require('node-schedule');

// Transporter object for E-mail (Cronjob)
var transporter = nodemailer.createTransport('smtps://admin%40alaskapirate.de:crayfish2013@smtp.strato.de');

var Festival = require('../models/festival-model.js');
var Emails = require('../models/email-model.js');
var EmailLog = require('../models/email-log-model.js');

var emailCount;
var logOfSentEmails;
var cronJob;

var m = EmailCronJob.prototype;

function EmailCronJob() {};

m.start = function () {
  cronJob = schedule.scheduleJob('20 * * * * *', function(){
    console.log("cronjob runs...");
    emailCount = 0;
    logOfSentEmails = [];
    m.datesOfFestivalThatAreApplicable(function(date, festival){
        m.getEmailTemplateForDate(date, function(emailTemplate){
          m.sendEmailForFestival(emailTemplate, festival, function(logEntry){
            m.saveFestivalStatus(date, festival, logEntry, function(){
              m.checkIfAllEmailsSent();
            });
          });
      })
    })
  });
  console.log("cronjob scheduled");
};

m.datesOfFestivalThatAreApplicable = function(callback){
  Festival.find({ "dates.deadline" : { $gte: moment().format(), $lt: moment().add(60, 'days').calendar() }}, function(err, festivals){
    festivals.forEach(function(festival){
      festival.dates.forEach(function(date){
        if (m.shouldEmailBeSent(date, festival)) {
          emailCount += 1;
          callback(date, festival);
        }
      });
    });
  });
}

m.checkIfAllEmailsSent = function () {
  if (emailCount == 0 && logOfSentEmails.length != 0) {
    m.sendReportEmail();
  }
}

m.sendReportEmail = function() {
  var sender = '"Stereo Satellite Booking" <booking@stereo-satellite.de>';
  var recipient = 'fabi.fink@gmail.com';
  var subject = 'AP Booking Manager - Reporting of ' + moment().format("DD-MM-YYYY");
  var body = '<p>Hi, </p><p>Es wurden wieder einmal Emails verschickt. An folgende Empfänger wurde eine Email versandt: </p>'
  logOfSentEmails.forEach(function(email){
    body = body.concat('<a href="' + process.env.ENV_URL + '/#/emaillog/' + email.id + '">' + email.recipient + '</a></br>');
  });

  m.sendEmailAsHTML(sender, recipient, subject, body, function(err, info){});
}

m.saveFestivalStatus = function (date, festival, logEntry, callback){
  date.status = "versendet";
  date.emailLogID = logEntry.id;
  logOfSentEmails.push(logEntry);
  festival.save(function(err, f){
    emailCount -= 1;
    callback()
  });
}

m.shouldEmailBeSent = function(date, festival) {
  return (date.status != "versendet" && date.contactType == "email" && typeof festival.email != "undefined")
}

m.getEmailTemplateForDate = function (date, callback) {
  var festivalDeadLine = moment(date.deadline);
  Emails.findOne({"date.startDate": {$lt: festivalDeadLine}, "date.endDate": {$gte: festivalDeadLine} }, {}, { sort: { 'date.endDate' : -1 } }, function(err, emailTemplate){
    callback(emailTemplate);
  });
}

m.sendEmailForFestival = function (email, festival, callback){
  if (email) {
    var body = email.body.replace(/%name%/g, festival.name).replace(/%festivalName%/g, festival.festivalName);
    var subject = email.subject.replace(/%name%/g, festival.name).replace(/%festivalName%/g, festival.festivalName);
    var email = String(festival.email);
    var sender = '"Stereo Satellite Booking" <booking@stereo-satellite.de>';
    var recipient = 'fabi.fink@gmail.com';

    m.sendEmailAsText(sender, recipient, subject, body, function(err, info){
      if(err){
        console.log(err);
      } else {
        m.createNewEmailLog(email, subject, body, callback);
      }
    });
  } else {
    console.log("no email template found.");
    emailCount -= 1;
  }

}

m.sendEmailAsHTML = function (sender, recipient, subject, body, callback) {
  var mailOptions = {
      from: sender, // sender address
      to: recipient, // list of receivers
      subject: subject, // Subject line
      html: body // plaintext body
  };

  m.sendEmail(mailOptions, callback);
}

m.sendEmailAsText = function (sender, recipient, subject, body, callback) {
  var mailOptions = {
      from: sender, // sender address
      to: recipient, // list of receivers
      subject: subject, // Subject line
      text: body // plaintext body
  };

  m.sendEmail(mailOptions, callback);
}

m.sendEmail = function(mailOptions, callback) {
  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(err, info){
    callback(err, info);
  });
}

m.createNewEmailLog = function(email, subject, body, callback) {
  var logEntry = new EmailLog({
    "recipient": email,
    "timestamp": moment(),
    "subject": subject,
    "body": body
  });
  logEntry.save(function(err, log){
    callback(log);
  });
}

module.exports = EmailCronJob;
