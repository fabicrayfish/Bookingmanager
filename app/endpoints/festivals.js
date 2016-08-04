var mongoose = require('mongoose');
var router = require('express').Router();

var Festival = require('../models/festival-model.js')




  router.get('/festivals', function(req, res){

    Festival.find({}, function(err, docs){
      if (err) {
        handleError(res, err.message, "Failed to get contact.");
      } else {
        res.status(200).json(docs);
      }
    });
  });


  router.get('/festivals/:id', function(req, res){
    var id = req.params.id;
    Festival.findById(id, function(err, docs){
      if (err) {
        handleError(res, err.message, "Failed to get contact.");
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
      festival.address.route = updatedFestival.address.route;
      festival.address.street_number = updatedFestival.address.street_number;
      festival.address.locality = updatedFestival.address.locality;
      festival.address.postal_code = updatedFestival.address.postal_code;
      festival.address.country = updatedFestival.address.country;
      festival.address.distance = updatedFestival.address.distance;
      festival.address.lat = updatedFestival.address.lat;
      festival.address.lng = updatedFestival.address.lng;

      festival.save(function(err){
        if (err) {
          handleError(res, err.message, err);
        }
        res.status(200).json(festival);
      });
    });
  });

module.exports = router;
