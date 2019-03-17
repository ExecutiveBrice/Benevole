'use strict';
var produits = require('./produit');
var users = require('./user');
var reservations = require('./reservation');
var emails = require('./email');
module.exports = {
  users: users,
  produits:produits,
  reservations:reservations,
  emails:emails
};
