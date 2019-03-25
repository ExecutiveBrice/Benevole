'use strict';
var users = require('./user');
var croisements = require('./croisement');
var benevoles = require('./benevole');
var emails = require('./email');
var stands = require('./stand')
module.exports = {
  users: users,
  benevoles:benevoles,
  croisements:croisements,
  stands:stands,
  emails:emails
};
