"use strict";

var express = require('express');

var mongoose = require('mongoose');

var bodyParser = require('body-parser');

var path = require('path');

var userRout = require('./routes/userRout');

var sauceRout = require('./routes/sauceRout');

var helmet = require('helmet');

var app = express();
mongoose.connect('mongodb+srv://akrt:DteGKySPhtQ8WLpg@piquante.isxp4.mongodb.net/Piquantes?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(function () {
  return console.log('Connexion à MongoDB réussie !');
})["catch"](function () {
  return console.log('Connexion à MongoDB échouée !');
});
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});
app.use(helmet());
app.use(bodyParser.json());
app.use('/images', express["static"](path.join(__dirname, 'images')));
app.use('/api/sauces', sauceRout);
app.use('/api/auth', userRout);
module.exports = app;