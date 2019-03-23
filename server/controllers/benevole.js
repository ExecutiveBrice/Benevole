'use strict';

var Croisement = require('../models').Croisement;
var Creneau = require('../models').Creneau;
var Stand = require('../models').Stand;
var Benevole = require('../models').Benevole;

module.exports = {

  getAll: function getAll(req, res) {
    console.log("getAll")
    return Benevole.findAll({
      include: [
        { model: Croisement}
      ]
    })
      .then(function (benevoles) {
        console.log("getAll - 2")
        console.log(benevoles)
        if (!benevoles) {
          return res.status(404).json({
            title: "No benevoles found",
            error: "Please try again."
          });
        }

        return res.status(200).json({
          message: 'benevoles found',
          benevoles: benevoles
        });
      }).catch(function (error) {
        console.log(error.toString());
        return res.status(400).json({
          title: 'There was an error signing in!',
          error: error.stack
        });
      });
  },

  getByMail: function getByStand(req, res) {
    console.log("getByMail")
    return Benevole.findAll({
      where: { 'email': (req.query.email)},
      include: [
        { model: Croisement}
      ]
    })
      .then(function (benevoles) {
        console.log("getByMail - 2")
        console.log(benevoles)
        if (!benevoles) {
          return res.status(404).json({
            title: "No benevoles found for this stand",
            error: "Please try again."
          });
        }

        return res.status(200).json({
          message: 'benevoles found for this stand',
          benevoles: benevoles
        });
      }).catch(function (error) {
        console.log(error.toString());
        return res.status(400).json({
          title: 'There was an error signing in!',
          error: error.stack
        });
      });
  },


  add: function add(req,res) {
    console.log("add")
    return Benevole.create({
      nom: req.body.nom,
      telephone: req.body.telephone,
      email: req.body.email,
      prenom: req.body.prenom
    })
      .then(function (benevole) {
        console.log("add - 2")
        console.log(benevole)
        if (!benevole) {
          return res.status(404).json({
            title: "No benevole added",
            error: "Please try again."
          });
        }
        return res.status(200).json({
          message: 'benevole added',
          benevole: benevole.id
        });
      }).catch(function (error) {
        console.log(error.toString());
        return res.status(400).json({
          message: 'There was an error adding!',
          error: error.stack
        });
      });
  },
};
