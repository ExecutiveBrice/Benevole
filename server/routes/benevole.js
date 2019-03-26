var express = require('express');
var router = express.Router();
var benevoleController = require('../controllers').benevoles;


router.get('/getAll', function(req,res,next) {
  console.log("------benevole getAll")
  return benevoleController.getAll(req,res);
});
router.get('/', function(req,res,next) {
  console.log("------benevole get")
  return benevoleController.get(req,res);
});
router.get('/byMail', function(req,res,next) {
  console.log("------benevole getByMail")
  return benevoleController.getByMail(req,res);
});
router.post('/', function(req,res,next) {
  console.log("------benevole add")
  return benevoleController.add(req,res);
});
router.put('/', function(req,res,next) {
  console.log("------benevole update")
  return benevoleController.update(req,res);
});




module.exports = router;
