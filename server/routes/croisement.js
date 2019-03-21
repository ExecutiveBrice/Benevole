var express = require('express');
var router = express.Router();
var croisementController = require('../controllers').croisements;


router.get('/getAll', function(req,res,next) {
  console.log("------croisement getAll")
  return croisementController.getAll(req,res);
});
router.get('/getByStand', function(req,res,next) {
  console.log("------croisement getByStand")
  return croisementController.getByStand(req,res);
});
router.get('/getByCreneau', function(req,res,next) {
  console.log("------croisement getByCreneau")
  return croisementController.getByCreneau(req,res);
});
module.exports = router;
