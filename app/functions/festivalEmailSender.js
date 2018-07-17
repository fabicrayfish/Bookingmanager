var EmailLog = require('../models/email-log-model.js');
var emailSender = require('./emailSender.js');
var Emails = require('../models/email-model.js');
var Festival = require('../models/festival-model.js');

var moment = require('moment');
var validator = require('validator');

var FestivalEmailSender = function(){

  function Email(email, festival) {
    var festivalName = festival.festivalName;
    var contactName = festival.name ? festival.name : festivalName;
    var contactTeam = festivalName + ' Team';
    if (festival.name) {
      var formOfAddress = 'Hallo ' + festival.name + ', Liebes ' + contactTeam + ',';
    } else {
      var formOfAddress = 'Liebes ' + contactTeam + ',';
    }


    this.body = email.body.replace(/%name%/g, contactName).replace(/%festivalName%/g, festivalName).replace(/%anrede%/g, formOfAddress);
    this.subject = email.subject.replace(/%name%/g, contactName).replace(/%festivalName%/g, festivalName);
    this.sender = process.env.MAIL_SENDER || '"Stereo Satellite Booking" <booking@stereo-satellite.de>';
    this.recipient = String(festival.email);
    this.bcc = process.env.MAIL_BCC || 'fabi@alaskapirate.de';
  }

  _sendFestivalEmails = function(festivals, callback) {
    var success = [];
    var error = [];
    if (festivals.length > 0) {
      getFestivalsWithEmailTemplates(festivals, function(festivalsWithEmail){
        var count = festivalsWithEmail.length;

        festivalsWithEmail.forEach(function(festivalWithEmail){
          sendLogAndUpdate(festivalWithEmail[1], festivalWithEmail[0], function(status, log) {
            count -= 1;

            if (status) {
              success.push(log);
            } else {
              error.push(festivalWithEmail[0]);
            }

            if(count === 0) {
              callback(success, error);
            }
          });
        });
      });
    } else {
      callback(success, error);
    }
  }

  getFestivalsWithEmailTemplates = function (festivals, callback) {
    var count = festivals.length;
    var festivalEmails = [];
    festivals.forEach(function(festival){
      getEmailTemplate(festival, (emailTemplate) => {
        count -= 1;
        festivalEmails.push([festival, emailTemplate]);

        if (count === 0 ) {
          callback(festivalEmails);
        }
      });
    });
  }

  getEmailTemplate = function (festival, callback) {
    var festivalDeadLine = moment();

    Emails.findOne({"date.startDate": {$lt: festivalDeadLine}, "date.endDate": {$gte: festivalDeadLine} }, {}, { sort: { 'date.endDate' : -1 } }, function(err, emailTemplate){
      callback(emailTemplate);
    });
  }

  sendLogAndUpdate = function(emailTemplate, festival, callback) {
    _sendAndLog(emailTemplate, festival, function(status, log){
      if (status) {
        saveFestivalStatus(festival, log, function(log) {
          callback(status, log);
        });
      } else {
        callback(status);
      }
    });
  }

  _sendAndLog = function (emailTemplate, festival, callback) {
    if (emailTemplate) {
      var email = new Email(emailTemplate, festival);

      if (validator.isEmail(email.recipient)) {
        emailSender.sendEmailAsText(email, function(err, info){
          if(err){
            console.log(err);
            callback(false);
          } else {
            createNewEmailLog(email, festival, callback);
          }
        });
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }

  }

  createNewEmailLog = function(email, festival, callback) {
    var logEntry = new EmailLog({
      "recipient": email.recipient,
      "timestamp": moment(),
      "subject": email.subject,
      "body": email.body,
      "festival": festival._id
    });
    logEntry.save(function(err, log){
      callback(true, log);
    });
  }

  saveFestivalStatus = function (festival, log, callback){
    festival.sent = [
      ...festival.sent,
      {
        date: moment(),
        emailLogId: log.id
      }
    ]
    log.emailLogId =  log.id;
    log.festivalName = festival.festivalName;
    festival.save(function(err, f){
      callback(log);
    });
  }
  return {
    sendAndLog          : _sendAndLog,
    sendFestivalEmails  : _sendFestivalEmails
  }
}();

module.exports = FestivalEmailSender;
