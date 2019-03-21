'use strict';
var produits = require('./produit');
var users = require('./user');
var reservations = require('./reservation');
var croisements = require('./croisement');
var creneaus = require('./creneau');
var benevoles = require('./benevole');
var emails = require('./email');
module.exports = {
  users: users,
  produits:produits,
  reservations:reservations,
  croisements:croisements,
  benevoles:benevoles,
  creneaus:creneaus,

  emails:emails
};
