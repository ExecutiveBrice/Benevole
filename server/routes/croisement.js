var express = require('express');
var router = express.Router();
var croisementController = require('../controllers').croisements;


router.get('/getAll', function(req,res,next) {
  console.log("------croisement getAll")
  return croisementController.getAll(req,res);
});


module.exports = router;
