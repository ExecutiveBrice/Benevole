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



module.exports = router;
