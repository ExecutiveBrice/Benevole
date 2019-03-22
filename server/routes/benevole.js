var express = require('express');
var router = express.Router();
var benevoleController = require('../controllers').benevoles;


router.get('/getAll', function(req,res,next) {
  console.log("------croisement getAll")
  return benevoleController.getAll(req,res);
});
router.get('/', function(req,res,next) {
  console.log("------croisement get")
  return benevoleController.get(req,res);
});
router.get('/getByMail', function(req,res,next) {
  console.log("------croisement getByMail")
  return benevoleController.getByMail(req,res);
});

module.exports = router;
