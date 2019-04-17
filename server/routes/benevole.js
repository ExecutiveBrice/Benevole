var express = require('express');
var router = express.Router();
var benevoleController = require('../controllers').benevoles;


router.get('/getAll', function(req,res,next) {
  console.log("------benevole getAll")
  return benevoleController.getAll(req,res);
});

router.get('/byMailLite', function(req,res,next) {
  console.log("------benevole getByMailLite")
  return benevoleController.getByMailLite(req,res);
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
router.put('/addCroisements', function(req,res,next) {
  console.log("------benevole updateCroisements")
  return benevoleController.addCroisements(req,res);
});
router.put('/updateReponse', function(req,res,next) {
  console.log("------benevole updateReponse")
  return benevoleController.updateReponse(req,res);
});




module.exports = router;
