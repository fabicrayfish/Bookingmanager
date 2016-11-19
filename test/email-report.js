process.env.DAYS_UNTIL_DEADLINE = 42;

var chai = require("chai");
var should = chai.should();
var emailReport = require("../app/functions/festivalBooking.js");
var chaiHttp = require('chai-http');
var utils = require('./utils');
var moment = require('moment');
var server = require('../server');
var festivalTestdata = require('./data/festivals-testdata');
var emailTemplateTestdata = require('./data/emailtemplate-testdata');
var dueFestivals = require('../app/functions/dueFestivals');

chai.use(chaiHttp);

describe("Festivals", function() {
  describe("/POST festival", function() {
    it("it should post a festival", function(done) {
      var count = festivalTestdata.length;

      festivalTestdata.forEach(function(festival) {
        chai.request(server)
            .post('/api/festivals')
            .set('x-access-token', utils.token)
            .send(festival)
            .end((err, res) => {
              count -= 1;
              res.should.have.status(200);
              res.body.should.have.property('festivalName');
              if (count === 0) {
                done();
              }
            });
      });

    });
  });
  describe("/GET Festivals", function() {
    it("it should return all festivals", function(done) {
      chai.request(server)
          .get('/api/festivals')
          .set('x-access-token', utils.token)
          .end((err, res) => {
            res.body.length.should.eql(festivalTestdata.length);
            done();
          });
    });
  });
  describe("GET due Festivals", function() {
    it("it should return the manual and email Festivals", function(done) {
      dueFestivals.getFestivals(function(emailFestivals, manualFestivals){
        emailFestivals.length.should.eql(2);
        manualFestivals.length.should.eql(1);
        done();
      });
    });
  })
});

describe("Email Templates", function() {
  describe("/POST Email Template", function() {
    it("it should post a festival", function(done) {
      var count = emailTemplateTestdata.length;

      emailTemplateTestdata.forEach(function(emailTemplate) {
        chai.request(server)
            .post('/api/emails')
            .set('x-access-token', utils.token)
            .send(emailTemplate)
            .end((err, res) => {
              count -= 1;
              res.should.have.status(200);
              res.body.should.have.property('subject');
              if (count === 0) {
                done();
              }
            });
      });

    });
  });
  describe("/GET Email Templates", function() {
    it("it should return all email templates", function(done) {
      chai.request(server)
          .get('/api/emails')
          .set('x-access-token', utils.token)
          .end((err, res) => {
            res.body.length.should.eql(emailTemplateTestdata.length);
            done();
          });
    });
  });
});

describe("Email Report Sender", function() {
  it("should test a thing", function(done) {
    emailReport.test(function(festivalEmails){
      festivalEmails.length.should.eql(2);
      done();
    });
  });
  /*describe("Email Reporting starts", function() {
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
  });*/
});
