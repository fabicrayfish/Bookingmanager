var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function(app) {

  // This is the generic schema for an article
  var Place = mongoose.model('Place', new Schema({
    route: String,
    street_number: String,
    locality: String,
    postal_code: String,
    country: String
  }));


  app.get("/places", function(req, res){

    Place.find({}, function(err, docs){
      if (err) {
        handleError(res, err.message, "Failed to get contact.");
      } else {
        res.status(200).json(docs);
      }
    });
  });


  app.get("/places/:id", function(req, res){
    var id = req.params.id;
    Place.findById(id, function(err, docs){
      if (err) {
        handleError(res, err.message, "Failed to get contact.");
      } else {
        res.status(200).json(docs);
      }
    });
  });

  app.post("/places", function(req, res) {
    var newPlace = req.body;

    var place = new Place(newPlace);

    place.save(function(err, place){
      if (err) {
        handleError(res, err.message, err);
      } else {
        res.status(200).json(place);
      }
    });


  });

  app.put("/places/:id", function(req,res) {
    var id = req.params.id;
    var updatedPlace = req.body;

    Place.findById(id, function(err, place){
      if (err) {
        handleError(res, err.message, err);
      }

      place.route = updatedPlace.route;
      place.street_number = updatedPlace.street_number;
      place.locality = updatedPlace.locality;
      place.postal_code = updatedPlace.postal_code;
      place.country = updatedPlace.country;

      place.save(function(err){
        if (err) {
          handleError(res, err.message, err);
        }
        res.status(200).json(place);
      });
    });
  });

};


