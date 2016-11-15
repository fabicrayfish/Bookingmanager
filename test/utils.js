process.env.NODE_ENV = 'test';
var mongoose = require('mongoose');
var chai = require("chai");
var should = chai.should();

var server = require('../server');
var User = require('../app/models/user.js');

before(function(done){
  function clearDB() {
    for (var i in mongoose.connection.collections) {
      mongoose.connection.collections[i].remove(function() {});
    }
    return done();
  }

  if (mongoose.connection.readyState === 0) {
    mongoose.connect(config.db.test, function (err) {
      if (err) {
        throw err;
      }
      return clearDB();
    });
  } else {
    return clearDB();
  }
});

before(function(){
  describe("User setup", function(){
    it("it should create a user", function(done){
      var userJSON = {
        "name" : "Fabi",
        "password" : "5ac53c97848ffeb975c558bd1b147adc",
        "admin" : true
      }
      var newUser = new User(userJSON);

      newUser.save(function(err, res){
        res.should.have.property('name').eql('Fabi');

        done();
      });
    });
  });
});
