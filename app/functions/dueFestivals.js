var Festival = require('../models/festival-model.js');
var moment = require('moment');

var DueFestivals = function(){
  _getFestivals = function(done){
    var daysUntilDeadline = process.env.DAYS_UNTIL_DEADLINE || 42;
    var manualFestivals = [];
    var emailFestivals = [];


    var notbefore = moment().format();
    var notafter = moment().add(daysUntilDeadline, 'days').format();

    Festival.find({ "date.deadline" : { $gte: notbefore, $lt: notafter }}, function(err, festivals){
      festivals.filter((festival) => {
        return isFestivalDue(festival, notbefore, notafter)
      }).map((dueFestival) => {
        if (dueFestival.date.contactType == "email" && typeof dueFestival.email != "undefined" ) {
          emailFestivals.push(dueFestival);
        } else {
          manualFestivals.push(dueFestival);
        }
      })

      done(emailFestivals, manualFestivals);
    });
  }

  isFestivalDue = function(festival, notbefore, notafter) {
    var date = festival.date;
    var isDateInRange = date.deadline >= moment(notbefore).toDate() && date.deadline <= moment(notafter).toDate();
    var isSent = festival.sent.find((date) => { 
      return moment(date).year() == moment().year() 
    });

    return (!isSent && isDateInRange)
  }

  return {
    getFestivals   : _getFestivals
  }
}();

module.exports = DueFestivals;
