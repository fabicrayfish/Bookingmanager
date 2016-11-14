var expect = require("chai").expect;
var emailReport = require("../app/functions/festivalBooking.js");
//var emailReport = new EmailCronJob();

describe("Email Report Sender", function() {
  describe("Email Reporting starts", function() {
    it("starts the email reporting", function() {
      var sendAllEmails = emailReport.sendEmailsToFestivals();

      expect(sendAllEmails).to.be.true;
    });
  });
  describe("All Emails should be sent", function() {
    it("checks if all Emails are sent", function() {
      var emailsSent = emailReport.checkIfAllEmailsSent();

      expect(emailsSent).to.be.false;
    });
  });
});
