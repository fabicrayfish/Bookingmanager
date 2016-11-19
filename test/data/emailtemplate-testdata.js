var moment = require('moment');

module.exports = [
{
    "subject" : "Bewerbung für %festivalName%",
    "body" : "Name: %name%\nFestival: %festivalName%",
    "date" : {
        "endDate" : moment().add(365, 'days').format(),
        "startDate" : moment().subtract(10, 'days').format()
    }
}];
