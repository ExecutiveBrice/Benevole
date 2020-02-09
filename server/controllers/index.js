'use strict';
var users = require('./user');
var croisements = require('./croisement');
var benevoles = require('./benevole');
var emails = require('./email');
var creneaus = require('./creneau');
var stands = require('./stand');


var configs = require('./config')
module.exports = {
  users: users,
  benevoles:benevoles,
  croisements:croisements,
  stands:stands,
  creneaus:creneaus,
  emails:emails,
  configs:configs
};
