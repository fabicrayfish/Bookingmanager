var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var mongoose = require("mongoose");
var ObjectID = mongodb.ObjectID;


var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
});


var db = mongoose.connection;
// Website you wish to allow to connect

db.on('error', console.error);

  // This is the generic schema for an article
var placesSchema = mongoose.Schema({
  route: String,
  street_number: String,
  locality: String,
  postal_code: String,
  country: String
});

var Place = mongoose.model('Place', placesSchema);

var mongodbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/';

mongoose.connect(mongodbURI);
console.log("Database connection ready.");

var server = app.listen(process.env.PORT || 5000, function() {
  var port = server.address().port;
  console.log("Server now running on port: ", port);
});


// Contacts API Routes

function handleError(res, reason, message, code) {
  console.log("Error: " + reason);
  res.status(code || 500).json({"error" : message});
}

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
