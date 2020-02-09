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
  getById: function getById(req, res) {
    console.log("getById")
    return Stand.findOne({
      include: [
        {
          model: Croisement,
          include: [
            { model: Creneau },
            { model: Benevole }
          ]
        }
      ]
    },{ where: { id: (req.query.id) } })
      .then(function (stands) {
        console.log("getById - 2")
        if (stands== null) {
          return res.status(404).json({
            title: "No stands found for this id",
            error: "Please try again."
          });
        }

        return res.status(200).json({
          message: 'stands found for this id',
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
  ajout: function ajout(req, res) {
    console.log("ajout")
    return Stand.create({
      nom: req.body.nom,
      description: req.body.description,
      bulle: req.body.bulle,
      etat: req.body.etat,
      ordre: req.body.ordre
    })
      .then(function (stand) {
        console.log("ajout - 2")
        if (!stand) {
          return res.status(404).json({
            title: "No stand ajout",
            error: "Please try again."
          });
        }
        return res.status(200).json({
          message: 'stand ajout',
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
  update: function update(req, res) {
    console.log("update")
    return Stand.update({
      nom: req.body.nom,
      description: req.body.description,
      bulle: req.body.bulle,
      etat: req.body.etat,
      ordre: req.body.ordre
    }, { where: { id: (req.body.id) } })
      .then(function (stand) {
        console.log("update - 2")
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
    return Stand.destroy({ where: { id: (req.query.id) } })
      .then(function (stand) {
        console.log("delete - 2")
        if (!stand) {
          return res.status(404).json({
            title: "No stand deleted",
            error: "Please try again."
          });
        }
        return res.status(200).json({
          message: 'stand deleted',
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
