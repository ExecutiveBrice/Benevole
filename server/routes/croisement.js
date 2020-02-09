var express = require('express');
var router = express.Router();
var croisementController = require('../controllers').croisements;


router.get('/getAll', function(req,res,next) {
  console.log("------croisement getAll")
  return croisementController.getAll(req,res);
});
router.get('/getById', function(req,res,next) {
  console.log("------croisement getById")
  return croisementController.getById(req,res);
});
router.get('/getByStand', function(req,res,next) {
  console.log("------croisement getByStand")
  return croisementController.getByStand(req,res);
});
router.get('/getByCreneau', function(req,res,next) {
  console.log("------croisement getByCreneau")
  return croisementController.getByCreneau(req,res);
});
router.get('/getByEtat', function(req,res,next) {
  console.log("------croisement getByEtat")
  return croisementController.getByEtat(req,res);
});


router.put('/', function(req,res,next) {
  console.log("------croisement update")
  return croisementController.update(req,res);
});
router.delete('/', function(req,res,next) {
  console.log("------croisement delete")
  return croisementController.delete(req,res);
});
router.post('/', function(req,res,next) {
  console.log("------croisement ajout")
  return croisementController.ajout(req,res);
});
module.exports = router;
