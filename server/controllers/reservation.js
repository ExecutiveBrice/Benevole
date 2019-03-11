'use strict';
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var Reservation = require('../models').Reservation;
var moment = require('moment');

module.exports = {

  getAll: function getAll(req,res) {
    console.log("getAll")
    return Reservation.findAll({})
      .then(function (reservations) {
        console.log("getAll - 2")
        console.log(reservations)
        if (!reservations) {
          return res.status(404).json({
            title: "No reservation found",
            error: "Please try again."
          });
        }

        return res.status(200).json({
          message: 'reservations found',
          reservations: reservations
        });
      }).catch(function (error) {
        console.log(error.toString());
        return res.status(400).json({
          title: 'There was an error signing in!',
          error: error.stack
        });
      });
  },
  getAllNew: function getAllNew(req,res) {
    console.log("getAllNew")
    return Reservation.findAll({
      where: {
      date: {
        $gte: moment().toDate(),
        $lt: moment().add(1, 'days').toDate()
      }
    }
    })
      .then(function (reservations) {
        console.log("getAllNew - 2")
        console.log(reservations)
        if (!reservations) {
          return res.status(404).json({
            title: "No reservation found",
            error: "Please try again."
          });
        }

        return res.status(200).json({
          message: 'reservations found',
          reservations: reservations
        });
      }).catch(function (error) {
        console.log(error.toString());
        return res.status(400).json({
          title: 'There was an error signing in!',
          error: error.stack
        });
      });
  },
  getAllTomorrow: function getAllTomorrow(req,res) {
    console.log("getAllTomorrow")
    return Reservation.findAll({
      where: {
      date: {
        $gte: moment().add(1, 'days').toDate(),
        $lt: moment().add(2, 'days').toDate()
      }
    }
    })
      .then(function (reservations) {
        console.log("getAllTomorrow - 2")
        console.log(reservations)
        if (!reservations) {
          return res.status(404).json({
            title: "No reservation found",
            error: "Please try again."
          });
        }

        return res.status(200).json({
          message: 'reservations found',
          reservations: reservations
        });
      }).catch(function (error) {
        console.log(error.toString());
        return res.status(400).json({
          title: 'There was an error signing in!',
          error: error.stack
        });
      });
  },
  add: function add(req,res) {
    console.log("add")
    return Reservation.create({
      nom: req.body.nom,
      tel: req.body.tel,
      mail: req.body.mail,
      date: req.body.date,
      etat: req.body.etat,
      alerte: req.body.alerte,
      description: req.body.description,
      produit: req.body.produit,
    })
      .then(function (reservation) {
        console.log("add - 2")
        console.log(reservation)
        if (!reservation) {
          return res.status(404).json({
            title: "No reservation added",
            error: "Please try again."
          });
        }
        return res.status(200).json({
          message: 'reservations added',
          reservation: reservation.id
        });
      }).catch(function (error) {
        console.log(error.toString());
        return res.status(400).json({
          message: 'There was an error adding!',
          error: error.stack
        });
      });
  },

  update: function update(req,res) {
    console.log("update")
    console.log(req.body)
    return Reservation.findOne({
      where: {id: (req.body.id)}
    }).then(function(reservation) {
      console.log(reservation)
      if (reservation) {

        return Reservation.update({
          etat: req.body.etat,
          alerte: req.body.alerte  
        }, {where: {id: (req.body.id)}}).then(function (reservation) {
          return res.status(200).json({
            message: "reservation updated successfully",
            obj: reservation
          });
        }).catch(function (error) {
          console.log(error);
          return res.status(400).json({
            message: 'There was an error updating!',
            error: error
          });
        });
      }
      return res.status(400).json({
        message: 'There was an error reservation not exist!',
        error: error
      });
    }).catch(function(error) {
      console.log(error)
      return res.status(400).json({
        message: "Error retrieving reservation",
        error: error
      });
    });
  }



};
