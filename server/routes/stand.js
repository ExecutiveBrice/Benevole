var express = require('express');
var router = express.Router();
var standController = require('../controllers').stands;


router.get('/getAll', function(req,res,next) {
  console.log("------stand getAll")
  return standController.getAll(req,res);
});
router.get('/getById', function(req,res,next) {
  console.log("------stand getById")
  return standController.getById(req,res);
});
router.put('/', function(req,res,next) {
  console.log("------stand update")
  return standController.update(req,res);
});
router.delete('/', function(req,res) {
  console.log("------stand delete")
  return standController.delete(req,res);
});
router.post('/', function(req,res,next) {
  console.log("------stand ajout")
  return standController.ajout(req,res);
});
module.exports = router;
