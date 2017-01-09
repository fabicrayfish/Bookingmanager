process.env.NODE_ENV = 'test';
var mongoose = require('mongoose');
var server = require('../server');

var DB = function(){
  function removeCollections(done) {
    for (var i in mongoose.connection.collections) {
      mongoose.connection.collections[i].remove(function() {});
    }
    return done();
  }

  function _clearDB(done) {
    if (mongoose.connection.readyState === 0) {
      mongoose.connect(config.db.test, function (err) {
        if (err) {
          throw err;
        }
        return removeCollections(done);
      });
    } else {
      return removeCollections(done);
    }
  }

  return {
    clearDB : _clearDB
  }
}();

module.exports = DB;
