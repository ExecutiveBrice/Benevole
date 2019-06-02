'use strict';

var Croisement = require('../models').Croisement;
var Creneau = require('../models').Creneau;
var Stand = require('../models').Stand;
var Benevole = require('../models').Benevole;
let idsToSkip = []; //generate array of ids, this may result in empty array
idsToSkip.push('-1'); // push a value that can not be the id in table. this will generate `not in ('-1')` query serving the purpose.

module.exports = {

  getAll: function getAll(req, res) {
    console.log("getAll")
    return Benevole.findAll({
      include: [
        {
          model: Croisement,
          include: [
            { model: Creneau },
            { model: Stand }
          ]
        }
      ]
    })
      .then(function (benevoles) {
        console.log("getAll - 2")
        console.log(benevoles)
        if (benevoles.length == 0) {
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

  getWithChoice: function getWithChoice(req, res) {
    console.log("getWithChoice")
    return Benevole.findAll({
      include: [
        {
          model: Croisement,
          where: {
            id: {
              $notIn: idsToSkip
            }
          },
          include: [
            { model: Creneau },
            { model: Stand }
          ]
        }
      ]
    })
      .then(function (benevoles) {
        console.log("getWithChoice - 2")
        console.log(benevoles)
        if (benevoles.length == 0) {
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

  getWithOutChoice: function getWithOutChoice(req, res) {
    console.log("getWithOutChoice")
    return Benevole.findAll({
      include: [
        {
          model: Croisement,
          include: [
            { model: Creneau },
            { model: Stand }
          ]
        }
      ],
      where: sequelize.where(
        sequelize.col('Croisement.id'),
        'IS',
        null
    )
    })
      .then(function (benevoles) {
        console.log("getWithOutChoice - 2")
        console.log(benevoles)
        if (benevoles.length == 0) {
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

  getByMail: function getByMail(req, res) {
    console.log("getByMail")
    console.log(req.query.email)
    return Benevole.findAll({
      where: { 'email': (req.query.email) },
      include: [
        {
          model: Croisement,
          include: [
            { model: Creneau },
            { model: Stand }
          ]
        }
      ]
    })
      .then(function (benevoles) {
        console.log("getByMail - 2")
        console.log(benevoles)
        if (benevoles.length == 0) {
          return res.status(400).json({
            title: "No benevoles found for this email",
            error: "Please try again."
          });
        }

        return res.status(200).json({
          message: 'benevoles found for this email',
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



  getByMailLite: function getByMailLite(req, res) {
    console.log("getByMailLite")
    console.log(req.query.email)
    return Benevole.findAll({
      where: { 'email': (req.query.email) },
    })
      .then(function (benevoles) {
        console.log("getByMailLite - 2")
        console.log(benevoles)
        if (benevoles.length == 0) {
          return res.status(400).json({
            title: "No benevoles found for this email",
            error: "Please try again."
          });
        }

        return res.status(200).json({
          message: 'benevoles found for this email',
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
  add: function add(req, res) {
    console.log("add")
    return Benevole.create({
      nom: req.body.nom,
      telephone: req.body.telephone,
      email: req.body.email,
      prenom: req.body.prenom
    })
      .then(function (benevole) {
        console.log("add - 2")
        console.log(benevole.id)
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

  update: function update(req, res) {
    console.log("update")
    console.log(req.body.Croisements)
    return Benevole.update({
      nom: req.body.nom,
      telephone: req.body.telephone,
      email: req.body.email,
      prenom: req.body.prenom,
      commentaire: req.body.commentaire,
      gateaux: req.body.gateaux
    }, { where: { id: (req.body.id) } })
      .then(function (benevole) {
        console.log("update - 2")
        console.log(benevole.id)
        if (!benevole) {
          return res.status(404).json({
            title: "No benevole updated",
            error: "Please try again."
          });
        }
        return res.status(200).json({
          message: 'benevole updated',
          benevole: benevole.id
        });
      }).catch(function (error) {
        console.log(error.toString());
        return res.status(400).json({
          message: 'There was an error updating!',
          error: error.stack
        });
      });
  },
  addCroisements: function addCroisements(req, res) {
    console.log("addCroisements")
    console.log(req.body.Croisements)
    return Benevole.findOne({ where: { id: (req.body.id) } })
      .then(function (benevole) {
        console.log(benevole);
        var idList = []
        for (var i=0; i<req.body.Croisements.length; i++){
          idList.push(req.body.Croisements[i].id)
        }
        benevole.setCroisements(idList).then(sc=>{
          console.log("addCroisements - setCroisements")
          console.log(sc);
      });

        console.log("addCroisements - 2")
        console.log(benevole.id)
        if (!benevole) {
          return res.status(404).json({
            title: "No benevole addCroisements",
            error: "Please try again."
          });
        }
        return res.status(200).json({
          message: 'benevole addCroisements',
          benevole: benevole.id
        });
      }).catch(function (error) {
        console.log(error.toString());
        return res.status(400).json({
          message: 'There was an error addCroisements!',
          error: error.stack
        });
      });
  }, 
  
  
  updateReponse: function updateReponse(req, res) {
    console.log("updateReponse")
    console.log(req.body.Croisements)
    return Benevole.update({
      reponse: req.body.reponse
    }, { where: { id: (req.body.id) } })
      .then(function (benevole) {
        console.log("updateReponse - 2")
        console.log(benevole.id)
        if (!benevole) {
          return res.status(404).json({
            title: "No benevole updateReponse",
            error: "Please try again."
          });
        }
        return res.status(200).json({
          message: 'benevole updateReponse',
          benevole: benevole.id
        });
      }).catch(function (error) {
        console.log(error.toString());
        return res.status(400).json({
          message: 'There was an error updateReponse!',
          error: error.stack
        });
      });
  },
};
