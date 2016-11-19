// Testmail
var mongoose = require('mongoose');
var moment = require('moment');
var schedule = require('node-schedule');


var Festival = require('../models/festival-model.js');
var Emails = require('../models/email-model.js');
var EmailLog = require('../models/email-log-model.js');
var emailSender = require('./emailSender.js');
var dueFestivals = require('./dueFestivals.js');

var emailCount;
var logOfSentEmails;
var logOfManualFestivals;
var cronJob;


var EmailCronJob = function(){
  emailCount = 0;
  logOfSentEmails = [];
  logOfManualFestivals = [];

  _start = function () {
    var cronjobTimer = process.env.CRON_TIMER || '20 * * * * *';
    cronJob = schedule.scheduleJob(cronjobTimer, function(){
      _sendEmailsToFestivals();
    });
    console.log("cronjob scheduled, timer set ist: ", cronjobTimer);
    console.log("system time: ", moment().format());
  };

  _test = function (done) {
    dueFestivals.getFestivals(function(emailFestivals, manualFestivals){
      var count = emailFestivals.length;
      var festivalEmails = [];
      emailFestivals.forEach(function(festival){

        getEmailTemplateForDate(festival[0]["dates"][festival[1]], function(emailTemplate){
          count -= 1;
          festivalEmails.push([festival, emailTemplate]);

          if (count === 0 ) {
            done(festivalEmails);
          }
        });
      });
    });
  };



  _sendEmailsToFestivals = function () {
    console.log("cronjob runs at ", moment().format());
    emailCount = 0;
    logOfSentEmails = [];
    logOfManualFestivals = [];
    datesOfFestivalThatAreApplicable(function(date, festival){
        getEmailTemplateForDate(date, function(emailTemplate){
          sendEmailForFestival(emailTemplate, festival, function(logEntry){
            saveFestivalStatus(date, festival, logEntry, function(){
              if(_checkIfAllEmailsSent()) {
                sendReportEmail();
              };
            });
          });
      })
    })
  };

  datesOfFestivalThatAreApplicable = function(callback){
    console.log("start date checker");
    var daysUntilDeadline = process.env.DAYS_UNTIL_DEADLINE || 42;

    var notbefore = moment().format();
    var notafter = moment().add(daysUntilDeadline, 'days').format();

    Festival.find({ "dates.deadline" : { $gte: notbefore, $lt: notafter }}, function(err, festivals){
      festivals.forEach(function(festival){
        festival.dates.forEach(function(date){
          if (shouldEmailBeSent(date, festival, notbefore, notafter)) {
            emailCount += 1;
            callback(date, festival);
          } else if (shouldFestivalBeContactedManually(date, festival)) {
            logOfManualFestivals.push(festival);
          }
        });
      });
    });
  }

  _checkIfAllEmailsSent = function () {
    console.log("manual festival count: " + logOfManualFestivals.length);
    if (emailCount == 0 && (logOfSentEmails.length != 0 || logOfManualFestivals.length > 0)) {
      return true;
    } else {
      return false;
    }
  }

  sendReportEmail = function() {
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

    console.log("Send report Email to:", recipient);
    emailSender.sendEmailAsHTML(sender, recipient, subject, body, function(err, info){});
  }

  saveFestivalStatus = function (date, festival, logEntry, callback){
    date.status = "versendet";
    date.emailLogID = logEntry.id;
    logEntry.festivalName = festival.festivalName;
    logOfSentEmails.push(logEntry);
    festival.save(function(err, f){
      emailCount -= 1;
      callback()
    });
  }

  shouldEmailBeSent = function(date, festival, notbefore, notafter) {

    var isDateInRange = date.deadline >= moment(notbefore).toDate() && date.deadline <= moment(notafter).toDate();
    return (date.status != "versendet" && date.contactType == "email" && typeof festival.email != "undefined" && isDateInRange)
  }

  shouldFestivalBeContactedManually = function(date, festival) {
    return (date.status != "versendet" && date.contactType != "email")
  }

  getEmailTemplateForDate = function (date, callback) {
    var festivalDeadLine = moment(date.deadline);

    Emails.findOne({"date.startDate": {$lt: festivalDeadLine}, "date.endDate": {$gte: festivalDeadLine} }, {}, { sort: { 'date.endDate' : -1 } }, function(err, emailTemplate){
      callback(emailTemplate);
    });
  }

  sendEmailForFestival = function (email, festival, callback){
    if (email) {
      var festivalName = festival.festivalName;
      var contactName = festival.name ? festival.name : festivalName;
      var contactTeam = festivalName + ' Team';
      if (festival.name) {
        var formOfAddress = 'Hallo ' + festival.name + ', Liebes ' + contactTeam + ',';
      } else {
        var formOfAddress = 'Liebes ' + contactTeam + ',';
      }


      var body = email.body.replace(/%name%/g, contactName).replace(/%festivalName%/g, festivalName).replace(/%anrede%/g, formOfAddress);
      var subject = email.subject.replace(/%name%/g, contactName).replace(/%festivalName%/g, festivalName);

      var sender = process.env.MAIL_SENDER || '"Stereo Satellite Booking" <booking@stereo-satellite.de>';
      var recipient = String(festival.email);
      var bcc = process.env.MAIL_BCC || 'fabi@alaskapirate.de';

      if (recipient) {
        emailSender.sendEmailAsText(sender, recipient, bcc, subject, body, function(err, info){
          if(err){
            console.log(err);
          } else {
            createNewEmailLog(recipient, festival._id, subject, body, callback);
          }
        });
      } else {
        emailCount -= 1;
        _checkIfAllEmailsSent();
      }
    } else {
      console.log("no email template found.");
      emailCount -= 1;
      _checkIfAllEmailsSent();
    }

  }

  createNewEmailLog = function(email, festivalID, subject, body, callback) {
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
  return {
    checkIfAllEmailsSent    : _checkIfAllEmailsSent,
    start                   : _start,
    sendEmailsToFestivals   : _sendEmailsToFestivals,
    logOfSentEmails         : logOfSentEmails,
    test                    : _test
  }
}();

module.exports = EmailCronJob;
