var express = require('express');
var router = express.Router();
var reservationController = require('../controllers').reservations;


router.get('/get', function(req,res,next) {
  console.log("------reservation get")
  return reservationController.get(req,res);
});
router.get('/getAll', function(req,res,next) {
  console.log("------reservation getAll")
  return reservationController.getAll(req,res);
});
router.get('/getAllNew', function(req,res,next) {
  console.log("------reservation getAllNew")
  return reservationController.getAllNew(req,res);
});
router.get('/getAllTomorrow', function(req,res,next) {
  console.log("------reservation getAllTomorrow")
  return reservationController.getAllTomorrow(req,res);
});
router.get('/', function(req,res,next) {
  console.log("-------reservation  get")
  return reservationController.get(req,res);
});

router.post('/', function(req,res,next) {
  console.log("-------reservation  post")
  return reservationController.add(req,res);
});
router.put('/', function(req,res,next) {
  console.log("-------reservation  put")
  return reservationController.update(req,res);
});

module.exports = router;
