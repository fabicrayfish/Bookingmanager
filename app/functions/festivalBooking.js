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


var EmailReport = function(){

  _start = function () {
    var cronjobTimer = process.env.CRON_TIMER || '* 30 * * * *';
    cronJob = schedule.scheduleJob(cronjobTimer, function(){
      _sendEmailsToFestivals();
    });
    console.log("cronjob scheduled, timer set ist: ", cronjobTimer);
    console.log("system time: ", moment().format());
  };

  _sendReportEmail = function(callback) {
    var email = {
      "sender": '"Stereo Satellite Booking" <booking@stereo-satellite.de>',
      "recipient": process.env.MAIL_REPORT_RECIPIENT || 'fabi.fink@gmail.com',
      "subject": 'AP Booking Manager - Reporting of ' + moment().format("DD-MM-YYYY")
    };

    _checkAndSendFestivals(function(sentFestivalsLog, errorFestivals, manualFestivals){
      email.body = createBody(sentFestivalsLog, errorFestivals, manualFestivals);

      emailSender.sendEmailAsHTML(email, function(err, info){
        callback(true);
      });
    });
  }

  _checkAndSendFestivals = function (callback) {
    dueFestivals.getFestivals(function(emailFestivals, manualFestivals){
      festivalEmailSender.sendFestivalEmails(emailFestivals, function(sentFestivalLog, errorFestivals){
        callback(sentFestivalLog, errorFestivals, manualFestivals);
      })
    });
  };

  createBody = function(sentFestivalsLog, errorFestivals, manualFestivals) {
    var envURL = process.env.ENV_URL || 'http://localhost:8888'

    var body = '<p>Hi, </p><p>Report für den ' +  moment().format("DD-MM-YYYY") + '</p>';
    if (sentFestivalsLog.length > 0) {
      body = body.concat('<p><b>Versendete Emails</b></p>');
      sentFestivalsLog.forEach(function(emailLog){
        body = body.concat('<a href="' + envURL + '/#/festival/' + emailLog.festival + '">' + emailLog.festivalName + '</a> (<a href="' + envURL + '/#/emaillog/' + emailLog.id + '"> Email </a>)</br>');
      });
    }
    if (manualFestivals.length > 0) {
      body = body.concat('<p><b>Offene Festivals</b></p>');
      manualFestivals.forEach(function(festival){
        body = body.concat('<a href="' + envURL + '/#/festival/' + festival._id + '">' + festival.festivalName + '</a></br>');
      });
    }

    if (errorFestivals.length > 0) {
      body = body.concat('<p><b>Fehlerhafte Festivals</b></p>');
      errorFestivals.forEach(function(festival){
        body = body.concat('<a href="' + envURL + '/#/festival/' + festival._id + '">' + festival.festivalName + '</a></br>');
      });
    }

    return body;
  }

  return {
    start                   : _start,
    checkAndSendFestivals   : _checkAndSendFestivals,
    sendReportEmail         : _sendReportEmail
  }
}();

module.exports = EmailReport;
