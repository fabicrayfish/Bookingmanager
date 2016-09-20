var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// This is the generic schema for an article
module.exports = mongoose.model('Festival', new Schema({
  festivalName: String,
  name: String,
  surname: String,
  facebookUrl: String,
  homepageUrl: String,
  email: String,
  address: {
    route: String,
    street_number: String,
    locality: String,
    postal_code: String,
    country: String,
    distance: String,
    lat: Number,
    lng: Number
  },
  dates: [{
    date: Date,
    deadline: Date,
    contactType: String,
    status: String,
    response: String,
    emailLogID: String
  }]
}));
