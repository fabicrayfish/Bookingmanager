var mongoose = require('mongoose');
var router = require('express').Router();

var Email = require('../models/email-model.js')

// Contacts API Routes

function handleError(res, reason, message, code) {
  console.log("Error: " + reason);
  res.status(code || 500).json({"error" : message});
}



  router.get('/emails', function(req, res){

    Email.find({}, function(err, docs){
      if (err) {
        handleError(res, err.message, "Failed to get emails.");
      } else {
        res.status(200).json(docs);
      }
    });
  });


  router.get('/emails/:id', function(req, res){
    var id = req.params.id;
    Email.findById(id, function(err, docs){
      if (err) {
        handleError(res, err.message, "Failed to get email.");
      } else {
        res.status(200).json(docs);
      }
    });
  });

  router.delete('/emails/:id', function(req, res){
    var id = req.params.id;
    Email.findById(id).remove( function(err, docs){
      if (err) {
        handleError(res, err.message, "Failed to delete email.");
      } else {
        res.status(200).json(docs);
      }
    });
  });

  router.post('/emails', function(req, res) {
    var newEmail = req.body;

    var email = new Email(newEmail);

    email.save(function(err, email){
      if (err) {
        handleError(res, err.message, err);
      } else {
        res.status(200).json(email);
      }
    });


  });

  router.put('/emails/:id', function(req,res) {
    var id = req.params.id;
    var updatedEmail = req.body;

    Email.findById(id, function(err, email){
      if (err) {
        handleError(res, err.message, err);
      }
      email.subject = updatedEmail.subject;
      email.body = updatedEmail.body;
      email.date.startDate = updatedEmail.startDate;
      email.date.endDate = updatedEmail.endDate;



      email.save(function(err){
        if (err) {
          handleError(res, err.message, err);
        }
        res.status(200).json(email);
      });
    });
  });

module.exports = router;
