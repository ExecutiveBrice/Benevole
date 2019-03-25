var express = require('express');
var router = express.Router();
var standController = require('../controllers').stands;


router.get('/getAll', function(req,res,next) {
  console.log("------stand getAll")
  return standController.getAll(req,res);
});

module.exports = router;
