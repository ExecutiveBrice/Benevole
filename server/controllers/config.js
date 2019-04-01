'use strict';
var Config = require('../models').Config;
module.exports = {

  getParam: function getParam(req, res) {
    console.log("getParam")
    return Config.findOne({ where: { param: (req.query.param) } })
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
    console.log(req.body)
    return Config.update({
      param: req.body.param,
      value: req.body.value,
    }, { where: { param: (req.body.param) } })
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
