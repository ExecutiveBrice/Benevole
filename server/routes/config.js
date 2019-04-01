var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));
var configController = require('../controllers').configs;

router.get('/isLock', function (req, res) {
    console.log("------ isLock")
    return configController.isLock(req,res);
});
router.put('/lockUnlock', function (req, res) {
    console.log("------ lockUnlock")
    return configController.lockUnlock(req,res);
});


module.exports = router;
