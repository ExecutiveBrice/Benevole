var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));
var emailsController = require('../controllers').emails;

router.post('/', function (req, res) {
    console.log("------ postMail")
    return emailsController.sendMail(req,res);
});

router.post('/rappel', function (req, res) {
    console.log("------ rappel")
    return emailsController.rappel(req,res);
});


module.exports = router;
