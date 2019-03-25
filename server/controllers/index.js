'use strict';
var users = require('./user');
var croisements = require('./croisement');
var benevoles = require('./benevole');
var emails = require('./email');
module.exports = {
  users: users,
  benevoles:benevoles,
  croisements:croisements,
  emails:emails
};
