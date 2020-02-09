'use strict';

var Creneau = require('../models').Creneau;

module.exports = {

  getAll: function getAll(req, res) {
    console.log("getAll")
    return Creneau.findAll({})
      .then(function (creneaux) {
        console.log("getAll - 2")
        if (creneaux.length == 0) {
          return res.status(404).json({
            title: "No creneaux found",
            error: "Please try again."
          });
        }
        return res.status(200).json({
          message: 'creneaux found',
          creneaux: creneaux
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
    return Creneau.create({
      plage: req.body.plage,
      ordre: req.body.ordre,
      groupe: req.body.groupe,
      chevauchement: req.body.chevauchement
    }, { where: { id: (req.body.id) } })
      .then(function (creneau) {
        console.log("ajout - 2")
        if (!creneau) {
          return res.status(404).json({
            title: "No creneau ajout",
            error: "Please try again."
          });
        }
        return res.status(200).json({
          message: 'creneau ajout',
          creneau: creneau.id
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
    return Creneau.update({
      plage: req.body.plage,
      ordre: req.body.ordre,
      groupe: req.body.groupe,
      chevauchement: req.body.chevauchement
    }, { where: { id: (req.body.id) } })
      .then(function (creneau) {
        console.log("update - 2")
        if (!creneau) {
          return res.status(404).json({
            title: "No creneau updated",
            error: "Please try again."
          });
        }
        return res.status(200).json({
          message: 'creneau updated',
          creneau: creneau.id
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
    return Creneau.destroy({ where: { id: (req.query.id) } })
      .then(function (creneau) {
        console.log("delete - 2")
        if (!creneau) {
          return res.status(404).json({
            title: "No creneau deleted",
            error: "Please try again."
          });
        }
        return res.status(200).json({
          message: 'creneau deleted',
          creneau: creneau.id
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
