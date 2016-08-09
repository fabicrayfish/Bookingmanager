var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// This is the generic schema for an article
module.exports = mongoose.model('Email', new Schema({
  subject: String,
  body: String,
  validFrom: Date,
  validUntil: Date
}));
