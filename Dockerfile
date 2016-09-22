FROM node:latest

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . /usr/src/app
