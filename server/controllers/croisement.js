'use strict';

var Croisement = require('../models').Croisement;
var Creneau = require('../models').Creneau;
var Stand = require('../models').Stand;
var Benevole = require('../models').Benevole;

module.exports = {

  getAll: function getAll(req, res) {
    console.log("getAll")
    return Croisement.findAll({
      include: [
        { model: Creneau},
        { model: Stand},
        { model: Benevole,
          attributes: ['id']}
      ]
    })
      .then(function (croisements) {
        console.log("getAll - 2")
        console.log(croisements)
        if (croisements.length == 0) {
          return res.status(404).json({
            title: "No croisements found",
            error: "Please try again."
          });
        }

        return res.status(200).json({
          message: 'croisements found',
          croisements: croisements
        });
      }).catch(function (error) {
        console.log(error.toString());
        return res.status(400).json({
          title: 'There was an error signing in!',
          error: error.stack
        });
      });
  },

  getByStand: function getByStand(req, res) {
    console.log("getByStand")
    return Croisement.findAll({
     
      include: [
        { model: Creneau},
        { model: Stand,
          where: { 'id': (req.query.id)}},
        { model: Benevole,
          attributes: ['id']}
      ]
    })
      .then(function (croisements) {
        console.log("getByStand - 2")
        console.log(croisements)
        if (croisements.length == 0) {
          return res.status(404).json({
            title: "No croisements found for this stand",
            error: "Please try again."
          });
        }

        return res.status(200).json({
          message: 'croisements found for this stand',
          croisements: croisements
        });
      }).catch(function (error) {
        console.log(error.toString());
        return res.status(400).json({
          title: 'There was an error signing in!',
          error: error.stack
        });
      });
  },

  getByCreneau: function getByCreneau(req, res) {
    console.log("getByCreneau")
    return Croisement.findAll({
      include: [
        { model: Creneau,
          where: { 'id': (req.query.id)}
        },
        { model: Stand},
        { model: Benevole,
          attributes: ['id']}
      ]
    })
      .then(function (croisements) {
        console.log("getByCreneau - 2")
        console.log(croisements)
        if (croisements.length == 0) {
          return res.status(404).json({
            title: "No croisements found for this Creneau",
            error: "Please try again."
          });
        }

        return res.status(200).json({
          message: 'croisements found for this Creneau',
          croisements: croisements
        });
      }).catch(function (error) {
        console.log(error.toString());
        return res.status(400).json({
          title: 'There was an error signing in!',
          error: error.stack
        });
      });
  },
};
