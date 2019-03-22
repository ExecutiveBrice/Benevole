'use strict';
var produits = require('./produit');
var users = require('./user');
var reservations = require('./reservation');
var croisements = require('./croisement');
var benevoles = require('./benevole');
var emails = require('./email');
module.exports = {
  users: users,
  produits:produits,
  benevoles:benevoles,
  reservations:reservations,
  croisements:croisements,
  emails:emails
};
