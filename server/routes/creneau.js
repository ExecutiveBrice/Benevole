var express = require('express');
var router = express.Router();
var creneauController = require('../controllers').creneaus;


router.get('/getAll', function(req,res,next) {
  console.log("------creneau getAll")
  return creneauController.getAll(req,res);
});
router.put('/', function(req,res,next) {
  console.log("------creneau update")
  return creneauController.update(req,res);
});
router.delete('/', function(req,res,next) {
  console.log("------creneau delete")
  return creneauController.delete(req,res);
});
router.post('/', function(req,res,next) {
  console.log("------creneau ajout")
  return creneauController.ajout(req,res);
});
module.exports = router;
