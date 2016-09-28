var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// This is the generic schema for an article
module.exports = mongoose.model('EmailLog', new Schema({
  recipient: String,
  timestamp: Date,
  subject: String,
  body: String,
  festival: {type: Schema.Types.ObjectId, ref: 'Festival'}
}));
