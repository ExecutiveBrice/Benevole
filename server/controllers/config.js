'use strict';
var Config = require('../models').Config;
module.exports = {

  
  getAll: function getAll(req, res) {
    console.log("getAll")
    return Config.findAll()
      .then(function (configs) {
        console.log("getAll - 2")
        if (configs.length == 0) {
          return res.status(404).json({
            title: "No configs found",
            error: "Please try again."
          });
        }

        return res.status(200).json({
          message: 'configs found',
          configs: configs
        });
      }).catch(function (error) {
        console.log(error.toString());
        return res.status(400).json({
          title: 'There was an error signing in!',
          error: error.stack
        });
      });
  },
  

  getParam: function getParam(req, res) {
    console.log("getParam")
    return Config.findOne({ where: { param: (req.query.param) } })
      .then(function (param) {
        console.log("getParam - 2")
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
      param: req.body.param,
      value: req.body.value,
    }, { where: { param: (req.body.param) } })
      .then(function (param) {
        console.log("updateParam - 2")
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
