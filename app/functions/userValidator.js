var jwt = require("jsonwebtoken");
var config = require("../../config.js");

var User = require('../models/user.js');

class UserValidator {

    static getUser(token, callback) {
      jwt.verify(token, config.jwtsecret, function(err, decoded) {
        if (err) { callback(err, null); }
        User.findOne({name: decoded.name}, function(err, user){
          if (err) {
            callback(err, null);
          } else {
            callback(null, user);
          }
        });
      });
    }
}

module.exports = UserValidator;
