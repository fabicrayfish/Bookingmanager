var moment = require('moment');

module.exports = [{
  "name" : "Max",
  "surname" : "Mustermann",
  "address" : {
      "country" : "Denmark",
      "distance" : "836 km",
      "lat" : 55.6760968,
      "lng" : 12.5683371,
      "locality" : "Copenhagen",
      "postal_code" : "",
      "route" : "",
      "street_number" : ""
  },
  "dates" : [
    {
        "date" : moment().add(365, 'days').format(),
        "deadline" : moment().add(process.env.DAYS_UNTIL_DEADLINE - 10, 'days').format(),
        "contactType" : "email",
        "status" : "nicht versendet",
    }
  ],
  "festivalName" : "Soundgarden",
  "email" : "fabi.fink@gmail.com"
},
{
  "name" : "Fabian",
  "surname" : "Fink",
  "address" : {
      "country" : "Denmark",
      "distance" : "836 km",
      "lat" : 55.6760968,
      "lng" : 12.5683371,
      "locality" : "Copenhagen",
      "postal_code" : "",
      "route" : "",
      "street_number" : ""
  },
  "dates" : [
    {
        "date" : moment().add(365, 'days').format(),
        "deadline" : moment().add(process.env.DAYS_UNTIL_DEADLINE - 15, 'days').format(),
        "contactType" : "email",
        "status" : "nicht versendet",
    }
  ],
  "festivalName" : "Rock am Ring",
  "email" : "fabi.fink@gmail.com"
},
{
  "name" : "Fabian",
  "surname" : "Fink",
  "address" : {
      "country" : "Denmark",
      "distance" : "836 km",
      "lat" : 55.6760968,
      "lng" : 12.5683371,
      "locality" : "Copenhagen",
      "postal_code" : "",
      "route" : "",
      "street_number" : ""
  },
  "dates" : [
    {
        "date" : moment().add(365, 'days').format(),
        "deadline" : moment().add(process.env.DAYS_UNTIL_DEADLINE - 15, 'days').format(),
        "contactType" : "email",
        "status" : "nicht versendet",
    }
  ],
  "festivalName" : "Rock am Ring",
  "email" : ""
},
{
  "name" : "Florian",
  "surname" : "Mueller",
  "address" : {
      "country" : "Deutschland",
      "distance" : "836 km",
      "lat" : 55.6760968,
      "lng" : 12.5683371,
      "locality" : "Copenhagen",
      "postal_code" : "",
      "route" : "",
      "street_number" : ""
  },
  "dates" : [
    {
        "date" : moment().add(365, 'days').format(),
        "deadline" : moment().add(process.env.DAYS_UNTIL_DEADLINE - 15, 'days').format(),
        "contactType" : "homepage",
        "status" : "nicht versendet",
    }
  ],
  "festivalName" : "Hurricane Festival"
}];
