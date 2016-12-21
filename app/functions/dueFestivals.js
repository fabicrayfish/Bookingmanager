var Festival = require('../models/festival-model.js');
var moment = require('moment');

var DueFestivals = function(){
  _getFestivals = function(done){
    var daysUntilDeadline = process.env.DAYS_UNTIL_DEADLINE || 42;
    var manualFestivals = [];
    var emailFestivals = [];


    var notbefore = moment().format();
    var notafter = moment().add(daysUntilDeadline, 'days').format();

    Festival.find({ "dates.deadline" : { $gte: notbefore, $lt: notafter }}, function(err, festivals){
      festivals.forEach(function(festival){
        festival.dates.forEach(function(date, key){
          if (shouldEmailBeSent(date, festival, notbefore, notafter)) {
            emailFestivals.push([festival, key]);
          } else if (shouldFestivalBeContactedManually(date, festival)) {
            manualFestivals.push(festival);
          }
        });
      });

      done(emailFestivals, manualFestivals);
    });
  }
  shouldEmailBeSent = function(date, festival, notbefore, notafter) {
    var isDateInRange = date.deadline >= moment(notbefore).toDate() && date.deadline <= moment(notafter).toDate();
    return (date.status != "versendet" && date.contactType == "email" && typeof festival.email != "undefined" && isDateInRange)
  }

  shouldFestivalBeContactedManually = function(date, festival) {
    return (date.status != "versendet" && date.contactType != "email")
  }
  return {
    getFestivals   : _getFestivals
  }
}();

module.exports = DueFestivals;
