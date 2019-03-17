var express = require('express');
var router = express.Router();
var path = require('path');

router.get('/', function (req, res, next) {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

router.use('*', function(req,res) {
  res.sendFile(__dirname, '../../dist/index.html');
});

module.exports = router;
