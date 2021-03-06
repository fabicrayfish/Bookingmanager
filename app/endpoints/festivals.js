var mongoose = require('mongoose');
var moment = require('moment');
var router = require('express').Router();

var Festival = require('../models/festival-model.js');

// Contacts API Routes

function handleError(res, reason, message, code) {
  console.log("Error: " + reason);
  res.status(code || 500).json({"error" : message});
}

  router.get('/schema-adaption', (req,res) => {
    Festival.find({}, (err, festivals) => {
      if (err) {
        handleError(res, err.message, "Failed to adapt schema for festivals.");
      } else {
        var log = {success: [], error: [], noToDo: []}

        festivals.map((festival) => {
          festival.sent = festival.dates.filter((date) => {
            if (date.status == "versendet" && date.contactType == "email") {
              return true
            }
            return false 
          }).map((date) => {
            return {
              date: date.date,
              emailLogId: date.emailLogID
            }
          })
          if (festival.dates.length > 0) {
            var lastDate = festival.dates[festival.dates.length - 1]
            festival.date = {
              date: lastDate.date,
              deadline: lastDate.deadline,
              contactType: lastDate.contactType
            }

            festival = formatFestival(festival)
          } else {
            festival.date = {
              date: null,
              deadline: null,
              contactType: null
            }
          }

          festival.dates = undefined

          festival.save(function(err){
            if (err) {
              log.error.push(festival.id + "_" + festival.festivalName)
            }
            log.success.push(festival.id + "_" + festival.festivalName)
          });

        })

        res.status(200).json(log);
      }
    })
  })


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

    festival = formatFestival(festival)

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
      if (updatedFestival.date) {
        festival.date = updatedFestival.date;
      } else {
        festival.date = {}
      }

      festival = formatFestival(festival)

      festival.save(function(err){
        if (err) {
          handleError(res, err.message, err);
        }
        res.status(200).json(festival);
      });
    });
  });

  function formatFestival(festival) {
    festival.date.date = moment(festival.date.date).year(1970)
    festival.date.deadline = moment(festival.date.deadline).year(1970)

    return festival
  }

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
          festival.comments = [
            ...festival.comments,
            newComment
          ]
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
