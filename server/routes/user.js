var express = require('express');
var router = express.Router();
var userController = require('../controllers').users;

router.post('/signup', function(req,res,next) {
  return userController.signup(req,res);
});

router.post('/login', function(req,res,next) {
  return userController.signin(req,res);
});

router.get('/', function(req,res,next) {
  return userController.getAll(req,res);
});

module.exports = router;
