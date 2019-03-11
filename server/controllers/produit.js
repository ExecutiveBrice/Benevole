'use strict';
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var Produit = require('../models').Produit;

module.exports = {

  getAll: function getAll(req,res) {
    console.log("getAll")
    return Produit.findAll({})
      .then(function (produits) {
        console.log("getAll - 2")
        console.log(produits)
        if (!produits) {
          return res.status(404).json({
            title: "No produit found",
            error: "Please try again."
          });
        }

        return res.status(200).json({
          message: 'produits found',
          produits: produits
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
    return Produit.create({
      nom: req.body.nom,
      tarif: req.body.tarif,
      description: req.body.description,
      image: req.body.image,
    })
      .then(function (produit) {
        console.log("add - 2")
        console.log(produit)
        if (!produit) {
          return res.status(404).json({
            title: "No produit added",
            error: "Please try again."
          });
        }
        return res.status(200).json({
          message: 'produits added',
          produit: produit.id
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
    return Produit.findOne({
      where: {id: (req.body.id)}
    }).then(function(produit) {
      console.log(produit)
      if (produit) {

        return Produit.update({
          nom: req.body.nom,
          tarif: req.body.tarif,
          description: req.body.description,
          image: req.body.image,
        }, {where: {id: (req.body.id)}}).then(function (produit) {
          return res.status(200).json({
            message: "produit updated successfully",
            obj: produit
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
        message: 'There was an error produit not exist!',
        error: error
      });
    }).catch(function(error) {
      console.log(error)
      return res.status(400).json({
        message: "Error retrieving produit",
        error: error
      });
    });
  }



};
