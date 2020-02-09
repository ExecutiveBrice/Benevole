'use strict';
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var User = require('../models').User;

module.exports = {
  getAll: function getAll(req, res) {
    console.log("getAll")
    return User.findAll()
      .then(function (users) {
        console.log("getAll - 2")
        if (users.length == 0) {
          return res.status(404).json({
            title: "No benevoles found",
            error: "Please try again."
          });
        }

        return res.status(200).json({
          message: 'benevoles found',
          users: users
        });
      }).catch(function (error) {
        console.log(error.toString());
        return res.status(400).json({
          title: 'There was an users!',
          error: error.stack
        });
      });
  },
  
  signup: function signup(req, res) {

    return User.findOne({
      where: {email: (req.body.email)}
    }).then(function(user) {

      if (user) {
        return res.status(401).json({
          message: "User already has account",
          error: "Try another account"
        });
      }
      return User.create({
      email: (req.body.email).toLowerCase(),
      password: (req.body.password === null)  ? null : bcrypt.hashSync(req.body.password),
      name: req.body.name
    }).then(function (user) {
      return res.status(200).json({
        title: "User signed up successfully",
        obj: user
      });
    }).catch(function (error) {
      console.log(error);
      return res.status(400).json({
        title: 'There was an error signing up!',
        error: error
      });
    });
    }).catch(function(error) {
      return res.status(400).json({
        message: "Error retrieving user",
        error: error
      });
    });
  },
  signin: function signin(req,res) {
    return User.findOne({where: {email: (req.body.email).toLowerCase()}})
      .then(function (user) {
        if (!user) {
          return res.status(404).json({
            title: "No user found",
            error: "Please try again."
          });
        }
        if (!bcrypt.compareSync(req.body.password, user.password)) {
          return res.status(401).json({
            title: "Incorrect password!",
            error: "Please try again."
          });
        }
        var token = jwt.sign({user: user}, 'secret', {expiresIn: 864000});
        return res.status(200).json({
          message: 'User Logged In Successfully',
          token: token,
          userId: user.id
        });
      }).catch(function (error) {
        console.log(error.toString());
        return res.status(400).json({
          title: 'There was an error signing in!',
          error: error.stack
        });
      });
  }
};
