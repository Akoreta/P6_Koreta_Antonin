"use strict";

var bcrypt = require('bcrypt');

var jwbtk = require('jsonwebtoken');

var User = require('../models/userMdl');

var schema = require('../models/password');

exports.signUp = function (req, res, next) {
  if (schema.validate(req.body.password)) {
    bcrypt.hash(req.body.password, 10).then(function (hash) {
      var user = new User({
        email: req.body.email,
        password: hash
      });
      user.save().then(function () {
        return res.status(201).json({
          message: 'Success users create'
        });
      })["catch"](function (error) {
        return res.status(400).json({
          error: error
        });
      });
    })["catch"](function (error) {
      return res.status(500).json({
        error: error
      });
    });
  } else {
    return res.status(400).json({
      message: 'Erreur'
    });
  }
};

exports.login = function (req, res, next) {
  User.findOne({
    email: req.body.email
  }).then(function (user) {
    if (!user) {
      return res.status(401).json({
        error: 'User or password not correct!'
      });
    }

    bcrypt.compare(req.body.password, user.password).then(function (valid) {
      if (!valid) {
        return res.status(401).json({
          message: 'User or password not correct'
        });
      }

      res.status(200).json({
        userId: user._id,
        token: jwbtk.sign({
          userId: user._id
        }, 'RANDOM_TOKEN_SECRET', {
          expiresIn: '24h'
        })
      });
    })["catch"](function (error) {
      return res.status(500).json({
        error: error
      });
    });
  })["catch"](function (error) {
    return res.status(500).json({
      error: error
    });
  });
};