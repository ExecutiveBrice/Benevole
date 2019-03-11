var express = require('express');
var router = express.Router();
var produitController = require('../controllers').produits;

router.get('/getAll', function(req,res,next) {
  console.log("------ getAll")
  return produitController.getAll(req,res);
});

router.get('/', function(req,res,next) {
  console.log("-------  get")
  return produitController.get(req,res);
});

router.post('/', function(req,res,next) {
  console.log("-------  post")
  return produitController.add(req,res);
});
router.put('/', function(req,res,next) {
  console.log("-------  put")
  return produitController.update(req,res);
});

module.exports = router;
