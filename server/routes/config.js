var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));
var configController = require('../controllers').configs;


router.get('/getAll', function(req,res,next) {
    console.log("------param getAll")
    return configController.getAll(req,res);
  });

router.get('/', function (req, res) {
    console.log("------ param")
    return configController.getParam(req,res);
});
router.put('/', function (req, res) {
    console.log("------ param")
    return configController.updateParam(req,res);
});


module.exports = router;
