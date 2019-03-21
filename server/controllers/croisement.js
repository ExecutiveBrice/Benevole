'use strict';

var Croisement = require('../models').Croisement;
var Creneau = require('../models').Creneau;

module.exports = {

  getAll: function getAll(req,res) {
    console.log("getAll")
    return Croisement.findAll({

      
                include: {model: Creneau}
                
    })
      .then(function (croisements) {
        console.log("getAll - 2")
        console.log(croisements)
        if (!croisements) {
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
 



};
