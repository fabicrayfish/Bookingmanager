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
var logOfManualFestivals;
var cronJob;

var m = EmailCronJob.prototype;

function EmailCronJob() {};

m.start = function () {
  var cronjobTimer = process.env.CRON_TIMER || '20 * * * * *';
  cronJob = schedule.scheduleJob(cronjobTimer, function(){
    console.log("cronjob runs...");
    emailCount = 0;
    logOfSentEmails = [];
    logOfManualFestivals = [];
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
  console.log("cronjob scheduled, timer set ist: ", cronjobTimer);
};

m.datesOfFestivalThatAreApplicable = function(callback){
  Festival.find({ "dates.deadline" : { $gte: moment().format(), $lt: moment().add(60, 'days').calendar() }}, function(err, festivals){
    festivals.forEach(function(festival){
      festival.dates.forEach(function(date){
        if (m.shouldEmailBeSent(date, festival)) {
          emailCount += 1;
          callback(date, festival);
        } else if (m.shouldFestivalBeContactedManually(date, festival)) {
          logOfManualFestivals.push(festival);
        }
      });
    });
    if(emailCount == 0 && logOfManualFestivals.length > 0) {
      m.sendReportEmail();
    }
  });
}

m.checkIfAllEmailsSent = function () {
  if (emailCount == 0 && logOfSentEmails.length != 0) {
    m.sendReportEmail();
  }
}

m.sendReportEmail = function() {
  var envURL = process.env.ENV_URL || 'http://localhost:8888'

  var sender = '"Stereo Satellite Booking" <booking@stereo-satellite.de>';
  var recipient = process.env.MAIL_REPORT_RECIPIENT || 'fabi.fink@gmail.com';
  var subject = 'AP Booking Manager - Reporting of ' + moment().format("DD-MM-YYYY");
  var body = '<p>Hi, </p><p>Report für den ' +  moment().format("DD-MM-YYYY") + '</p>';
  if (logOfSentEmails.length > 0) {
    body = body.concat('<p><b>Versendete Emails</b></p>');
    logOfSentEmails.forEach(function(emailLog){
      body = body.concat('<a href="' + envURL + '/#/festival/' + emailLog.festival + '">' + emailLog.festivalName + '</a> (<a href="' + envURL + '/#/emaillog/' + emailLog.id + '"> Email </a>)</br>');
    });
  }

  if (logOfManualFestivals.length > 0) {
    body = body.concat('<p><b>Offene Festivals</b></p>');
    logOfManualFestivals.forEach(function(festival){
      body = body.concat('<a href="' + envURL + '/#/festival/' + festival._id + '">' + festival.festivalName + '</a></br>');
    });
  }


  m.sendEmailAsHTML(sender, recipient, subject, body, function(err, info){});
}

m.saveFestivalStatus = function (date, festival, logEntry, callback){
  date.status = "versendet";
  date.emailLogID = logEntry.id;
  logEntry.festivalName = festival.festivalName;
  logOfSentEmails.push(logEntry);
  festival.save(function(err, f){
    emailCount -= 1;
    callback()
  });
}

m.shouldEmailBeSent = function(date, festival) {
  return (date.status != "versendet" && date.contactType == "email" && typeof festival.email != "undefined")
}

m.shouldFestivalBeContactedManually = function(date, festival) {
  return (date.status != "versendet" && date.contactType != "email")
}

m.getEmailTemplateForDate = function (date, callback) {
  var festivalDeadLine = moment(date.deadline);
  Emails.findOne({"date.startDate": {$lt: festivalDeadLine}, "date.endDate": {$gte: festivalDeadLine} }, {}, { sort: { 'date.endDate' : -1 } }, function(err, emailTemplate){
    callback(emailTemplate);
  });
}

m.sendEmailForFestival = function (email, festival, callback){
  if (email) {
    var festivalName = festival.festivalName + ' Festival';
    var contactName = festival.name ? festival.name : festivalName;

    var body = email.body.replace(/%name%/g, contactName).replace(/%festivalName%/g, festivalName);
    var subject = email.subject.replace(/%name%/g, contactName).replace(/%festivalName%/g, festivalName);

    var sender = '"Stereo Satellite Booking" <booking@stereo-satellite.de>';
    var recipient = String(festival.email);

    m.sendEmailAsText(sender, recipient, subject, body, function(err, info){
      if(err){
        console.log(err);
      } else {
        m.createNewEmailLog(recipient, festival._id, subject, body, callback);
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

m.createNewEmailLog = function(email, festivalID, subject, body, callback) {
  var logEntry = new EmailLog({
    "recipient": email,
    "timestamp": moment(),
    "subject": subject,
    "body": body,
    "festival": festivalID
  });
  logEntry.save(function(err, log){
    callback(log);
  });
}

module.exports = EmailCronJob;
