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


var FestivalReport = function(){

  _startCron = function () {
    var cronjobTimer = process.env.CRON_TIMER || '* 30 * * * *';
    cronJob = schedule.scheduleJob(cronjobTimer, function(){
      _triggerFestivalReport(function(status){
        if(status) {
          console.log("Festival Report succesfully sent.");
        } else {
          console.log("Festival Report was unsuccesfull. Report Email could not be sent.");
        }
      });
    });
    console.log("cronjob scheduled, timer set ist: ", cronjobTimer);
    console.log("system time: ", moment().format());
  };

  _triggerFestivalReport = function(callback) {
    console.log("Festival report got triggered on: ", moment().format());
    var email = {
      "sender": '"Stereo Satellite Booking" <booking@stereo-satellite.de>',
      "recipient": process.env.MAIL_REPORT_RECIPIENT || 'fabi.fink@gmail.com',
      "subject": 'AP Booking Manager - Reporting of ' + moment().format("DD-MM-YYYY")
    };

    _checkAndSendFestivals(function(sentFestivalsLog, errorFestivals, manualFestivals){
      if (shouldReportBeSend(sentFestivalsLog, errorFestivals, manualFestivals)) {
        email.body = createBody(sentFestivalsLog, errorFestivals, manualFestivals);
        console.log("FESTIVALS PROCESSED");
        console.log("Count of Email Festivals: ", sentFestivalsLog.length);
        console.log("Count of Manual Festivals: ", manualFestivals.length);
        console.log("Count of Festivals with Error: ", errorFestivals.length);

        emailSender.sendEmailAsHTML(email, function(err, info){
          callback(true);
        });
      } else {
        callback(false);
      }
    });
  }

  shouldReportBeSend = function(sent, error, manual) {
    if (sent.length > 0 || error.length > 0 || manual.length > 0) {
      return true;
    } else {
      return false;
    }
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
    startCron               : _startCron,
    checkAndSendFestivals   : _checkAndSendFestivals,
    triggerFestivalReport   : _triggerFestivalReport
  }
}();

module.exports = FestivalReport;
