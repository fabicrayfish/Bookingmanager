var chai = require("chai");
var should = chai.should();
var emailReport = require("../app/functions/festivalBooking.js");
var chaiHttp = require('chai-http');
var utils = require('./utils');
var server = require('../server');

chai.use(chaiHttp);

describe("Festivals", function() {
  describe("/POST festival", function() {
    it("it should post a festival", function(done) {
      var festival = {
        "name" : "",
        "surname" : "Mustermann",
        "address" : {
            "country" : "Denmark",
            "distance" : "836 km",
            "lat" : 55.6760968,
            "lng" : 12.5683371,
            "locality" : "Copenhagen",
            "postal_code" : "",
            "route" : "",
            "street_number" : ""
        },
        "festivalName" : "Soundgarden",
        "email" : "fabi.fink@gmail.com"
      }
      chai.request(server)
          .post('/api/festivals')
          .send(festival)
          .end((err, res) => {
            console.log(res.body);
            res.should.have.status(403);
            res.body.should.be.a('array');

            done();
          });
    });
  });
});

describe("Email Report Sender", function() {
  describe("Email Reporting starts", function() {
    it("starts the email reporting", function() {
      var sendAllEmails = emailReport.sendEmailsToFestivals();

      sendAllEmails.should.be.true;
    });
  });
  describe("All Emails should be sent", function() {
    it("checks if all Emails are sent", function() {
      var emailsSent = emailReport.checkIfAllEmailsSent();

      emailsSent.should.be.false;
    });
  });
});
