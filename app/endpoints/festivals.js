var mongoose = require('mongoose');
var router = require('express').Router();

var Festival = require('../models/festival-model.js');

// Contacts API Routes

function handleError(res, reason, message, code) {
  console.log("Error: " + reason);
  res.status(code || 500).json({"error" : message});
}



  router.get('/festivals', function(req, res){

    Festival.find({}, function(err, docs){
      if (err) {
        handleError(res, err.message, "Failed to get festival.");
      } else {
        res.status(200).json(docs);
      }
    });
  });


  router.get('/festivals/:id', function(req, res){
    var id = req.params.id;
    Festival.findById(id).
    populate('comments.author').
    exec(function(err, docs){
      if (err) {
        handleError(res, err.message, "Failed to get festival.");
      } else {
        res.status(200).json(docs);
      }
    });
  });

  router.delete('/festivals/:id', function(req, res){
    var id = req.params.id;
    Festival.findById(id).remove( function(err, docs){
      if (err) {
        handleError(res, err.message, "Failed to delete festival.");
      } else {
        res.status(200).json(docs);
      }
    });
  });

  router.post('/festivals', function(req, res) {
    var newFestival = req.body;

    var festival = new Festival(newFestival);

    festival.save(function(err, festival){
      if (err) {
        handleError(res, err.message, err);
      } else {
        res.status(200).json(festival);
      }
    });


  });

  router.put('/festivals/:id', function(req,res) {
    var id = req.params.id;
    var updatedFestival = req.body;

    Festival.findById(id, function(err, festival){
      if (err) {
        handleError(res, err.message, err);
      }
      festival.festivalName = updatedFestival.festivalName;
      festival.name = updatedFestival.name;
      festival.surname = updatedFestival.surname;
      festival.facebookUrl = updatedFestival.facebookUrl;
      festival.homepageUrl = updatedFestival.homepageUrl;
      festival.email = updatedFestival.email;
      if (updatedFestival.address){
        festival.address.route = updatedFestival.address.route;
        festival.address.street_number = updatedFestival.address.street_number;
        festival.address.locality = updatedFestival.address.locality;
        festival.address.postal_code = updatedFestival.address.postal_code;
        festival.address.country = updatedFestival.address.country;
        festival.address.distance = updatedFestival.address.distance;
        festival.address.lat = updatedFestival.address.lat;
        festival.address.lng = updatedFestival.address.lng;
      } else {
        festival.address = {};
      }
      if (updatedFestival.dates) {
        festival.dates = updatedFestival.dates;
      } else {
        festival.dates = {}
      }



      festival.save(function(err){
        if (err) {
          handleError(res, err.message, err);
        }
        res.status(200).json(festival);
      });
    });
  });

  router.post('/festivals/:id/comments', function(req, res) {
    var UserValidator = require("../functions/userValidator.js");

    var id = req.params.id;
    var newComment = req.body;
    var token = req.headers['x-access-token'];


    UserValidator.getUser(token, function(err, user) {
      if (err) { handleError(res, err.message, err); }
      newComment.author = user;
      Festival.findById(id, function(err, festival){
        if (err) { handleError(res, err.message, err); }

        if (festival.comments){
          festival.comments.push(newComment);
        } else {
          festival.comments = {newComment};
        }



        festival.save(function(err){
          if (err) {
            handleError(res, err.message, err);
          }
          res.status(200).json(festival.comments[festival.comments.length - 1]);
        });
      });
    });




  });

module.exports = router;
