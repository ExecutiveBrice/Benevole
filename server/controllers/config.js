'use strict';

var Stand = require('../models').Config;

module.exports = {

  getParam: function getParam(req, res) {
    console.log("getParam")
    return Config.findOne({ where: { param: (req.body.param) } })
      .then(function (param) {
        console.log("getParam - 2")
        console.log(param)
        if (!param) {
          return res.status(404).json({
            title: "No param found",
            error: "Please try again."
          });
        }

        return res.status(200).json({
          message: 'param found',
          param: param
        });
      }).catch(function (error) {
        console.log(error.toString());
        return res.status(400).json({
          title: 'There was an error finding param',
          error: error.stack
        });
      });
  },
  updateParam: function updateParam(req, res) {
    console.log("updateParam")
    return Config.update({
      nom: req.body.nom,
      telephone: req.body.telephone,
      email: req.body.email,
      prenom: req.body.prenom,
      commentaire: req.body.commentaire,
      gateaux: req.body.gateaux
    }, { where: { id: (req.body.id) } })
      .then(function (param) {
        console.log("updateParam - 2")
        console.log(param)
        if (!param) {
          return res.status(404).json({
            title: "No param found",
            error: "Please try again."
          });
        }

        return res.status(200).json({
          message: 'param updated',
          param: param
        });
      }).catch(function (error) {
        console.log(error.toString());
        return res.status(400).json({
          title: 'There was an error finding param',
          error: error.stack
        });
      });
  },
};
