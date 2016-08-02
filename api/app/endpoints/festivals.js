var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function(app) {

  // This is the generic schema for an article
  var Festival = mongoose.model('Festival', new Schema({
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
    }
  }));


  app.get("/festivals", function(req, res){

    Festival.find({}, function(err, docs){
      if (err) {
        handleError(res, err.message, "Failed to get contact.");
      } else {
        res.status(200).json(docs);
      }
    });
  });


  app.get("/festivals/:id", function(req, res){
    var id = req.params.id;
    Festival.findById(id, function(err, docs){
      if (err) {
        handleError(res, err.message, "Failed to get contact.");
      } else {
        res.status(200).json(docs);
      }
    });
  });

  app.post("/festivals", function(req, res) {
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

  app.put("/festivals/:id", function(req,res) {
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

};
