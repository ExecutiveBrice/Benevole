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
  
  getById: function getById(req, res) {
    console.log("getById")
    return Croisement.findOne({ where: { id: (req.body.id) } })
      .then(function (croisement) {
        console.log("getById - 2")
        if (croisement== null) {
          return res.status(404).json({
            title: "No croisement found for this id",
            error: "Please try again."
          });
        }

        return res.status(200).json({
          message: 'croisements found for this id',
          croisement: croisement
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

  getByEtat: function getByEtat(req, res) {
    console.log("getByEtat")
    return Croisement.findAll({
      include: [
        { model: Creneau},
        { model: Stand,
          where: { etat: (req.query.etat)}
        },
        { model: Benevole,
          attributes: ['id']}
      ]
    })
      .then(function (croisements) {
        console.log("getByEtat - 2")
        if (croisements.length == 0) {
          return res.status(404).json({
            title: "No croisements found for this Stand etat",
            error: "Please try again."
          });
        }

        return res.status(200).json({
          message: 'croisements found for this Stand etat',
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

  ajout: function ajout(req, res) {
    console.log("ajout")
    return Croisement.create({
      limite: req.body.limite,
      besoin: req.body.besoin,
      selected: req.body.selected,
    })
      .then(function (croisement) {
        console.log("ajout - 2")
        croisement.setStand(req.body.Stand.id).then(stand => {
          console.log("addCroisements - setStand")
        });
        console.log(req.body.Creneau)
        croisement.setCreneau(req.body.Creneau.id).then(creneau => {
          console.log("addCroisements - setCreneau")
        });

        if (!croisement) {
          return res.status(404).json({
            title: "No croisement ajout",
            error: "Please try again."
          });
        }
        return res.status(200).json({
          message: 'croisement ajout',
          croisement: croisement.id
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
    return Croisement.update({
      limite: req.body.limite,
      besoin: req.body.besoin,
      selected: req.body.selected
    }, { where: { id: (req.body.id) } })
      .then(function (croisement) {
        console.log("update - 2")
        if (!croisement) {
          return res.status(404).json({
            title: "No croisement updated",
            error: "Please try again."
          });
        }
        return res.status(200).json({
          message: 'croisement updated',
          croisement: croisement.id
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
    return Croisement.destroy({ where: { id: (req.query.id) } })
      .then(function (croisement) {
        console.log("delete - 2")
        if (!croisement) {
          return res.status(404).json({
            title: "No croisement deleted",
            error: "Please try again."
          });
        }
        return res.status(200).json({
          message: 'croisement deleted',
          croisement: croisement.id
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
