'use strict';

var Stand = require('../models').Stand;
var Croisement = require('../models').Croisement;
var Creneau = require('../models').Creneau;
var Benevole = require('../models').Benevole;

module.exports = {

  getAll: function getAll(req, res) {
    console.log("getAll")
    return Stand.findAll({
      include: [
        {
          model: Croisement,
          include: [
            { model: Creneau },
            { model: Benevole }
          ]
        }
      ]
    })
      .then(function (stands) {
        console.log("getAll - 2")
        console.log(stands)
        if (stands.length == 0) {
          return res.status(404).json({
            title: "No stands found",
            error: "Please try again."
          });
        }

        return res.status(200).json({
          message: 'stands found',
          stands: stands
        });
      }).catch(function (error) {
        console.log(error.toString());
        return res.status(400).json({
          title: 'There was an error signing in!',
          error: error.stack
        });
      });
  },

  update: function update(req, res) {
    console.log("update")
    console.log(req.body.Stand)
    return Stand.update({
      nom: req.body.nom,
      description: req.body.description,
      bulle: req.body.bulle
    }, { where: { id: (req.body.id) } })
      .then(function (stand) {
        console.log("update - 2")
        console.log(stand.id)
        if (!stand) {
          return res.status(404).json({
            title: "No stand updated",
            error: "Please try again."
          });
        }
        return res.status(200).json({
          message: 'stand updated',
          stand: stand.id
        });
      }).catch(function (error) {
        console.log(error.toString());
        return res.status(400).json({
          message: 'There was an error updating!',
          error: error.stack
        });
      });
  },
  delete: function supp(req, res) {
    console.log("delete")
    console.log(req.body.Stand)
    return Stand.delete({}, { where: { id: (req.body.id) } })
      .then(function (stand) {
        console.log("delete - 2")
        console.log(stand.id)
        if (!stand) {
          return res.status(404).json({
            title: "No stand updated",
            error: "Please try again."
          });
        }
        return res.status(200).json({
          message: 'stand updated',
          stand: stand.id
        });
      }).catch(function (error) {
        console.log(error.toString());
        return res.status(400).json({
          message: 'There was an error updating!',
          error: error.stack
        });
      });
  },
};
