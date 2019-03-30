'use strict';

var Stand = require('../models').Stand;


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

};
