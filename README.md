# BookingManager

This is a project based on node.js and Angular to support the festival booking for a band. The tool supports to add a numerous amount of festivals with deadlines. Based on those deadlines emails will be sent out automatically based on the festivals information.

The emails are based on templates that can be defined individually.

![Bookingmanager](http://www.alaskapirate.de/images/bookingmanager.png)

## Configure the bookingmanager

In order to use this bookingmanager, please define the following variables in the docker-compose.yml:
~~~~
  ENV_URL
  ENV_PORT
  ENV_MONGO_URI
  CRON_TIMER
  MAIL_REPORT_RECIPIENT
  MAIL_BCC
  DAYS_UNTIL_DEADLINE
~~~~

## Run the bookingmanager

In order to run the bookingmanager locally the only prerequisite is to have Docker installed on your machine. There is a docker-compose file already within the repository, which will start a container with a mongodb server, as well as a container with the bookingmanager itself. Ready to run.

~~~~
  docker-compose up
~~~~
