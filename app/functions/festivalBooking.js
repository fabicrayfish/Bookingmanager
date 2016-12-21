// Testmail
var mongoose = require('mongoose');
var moment = require('moment');
var schedule = require('node-schedule');


var Festival = require('../models/festival-model.js');
var Emails = require('../models/email-model.js');
var EmailLog = require('../models/email-log-model.js');
var emailSender = require('./emailSender.js');
var dueFestivals = require('./dueFestivals.js');
var festivalEmailSender = require('./festivalEmailSender.js');

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
      festivalEmailSender.sendFestivalEmails(emailFestivals, function(success, error){
        done(success, error);
      })
    });
  };


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

  return {
    start                   : _start,
    test                    : _test
  }
}();

module.exports = EmailCronJob;
