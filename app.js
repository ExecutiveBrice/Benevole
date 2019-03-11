const compression = require('compression');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const logger = require('morgan');


const index = require('./server/routes/index');
const user = require('./server/routes/user');
const reservation = require('./server/routes/reservation');
const produit = require('./server/routes/produit');
const email = require('./server/routes/email');


const url = "https://olivemirabelle.herokuapp.com/";
const devUrl = "http://localhost:4200";

const app = express();

require('dotenv').config();

app.use(compression());
app.set('views', path.join(__dirname, './dist'));
app.set('view engine', 'ejs');

app.use(logger('dev'));

app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({extended: true}, {limit: '10mb'}));
app.use(cookieParser());

app.use(function (req,res,next) {
  //res.header("Access-Control-Allow-Origin",  (process.env.NODE_ENV === 'production') ? url : devUrl);
  res.header("Access-Control-Allow-Origin",  '*');
    res.header('Access-Control-Allow-Methods', 'PUT, PATCH, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use(function(req, res, next) {
  if (process.env.NODE_ENV || process.env.NODE_ENV === 'production') {
      if(req.headers["x-forwarded-proto"] === "https"){
        return next();
      }
   return res.redirect('https://'+req.hostname+req.url);
  }
  return next();
});

app.use('/email', email);
app.use('/reservation', reservation);
app.use('/produit', produit);
app.use('/user', user);
app.use('/', index);

app.use(express.static(path.join(__dirname, './dist')));

app.use('*', index);

module.exports = app;
