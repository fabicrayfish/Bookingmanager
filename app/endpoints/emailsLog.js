var mongoose = require('mongoose');
var router = require('express').Router();

var EmailLog = require('../models/email-log-model.js')

// Contacts API Routes

function handleError(res, reason, message, code) {
  console.log("Error: " + reason);
  res.status(code || 500).json({"error" : message});
}





router.get('/emailslog/:id', function(req, res){
  var id = req.params.id;
  EmailLog.findById(id, function(err, docs){
    if (err) {
      handleError(res, err.message, "Failed to get email.");
    } else {
      res.status(200).json(docs);
    }
  });
});


module.exports = router;
