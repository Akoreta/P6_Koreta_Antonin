"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Sauce = require('../models/sauceMdl');

var bcrypt = require('bcrypt');

var jswtk = require('jsonwebtoken');

var fs = require('fs');

var sauceReg = new RegExp(/^[a-z,-,é,è,.'-\s]+$/i);

exports.getSauce = function (req, res, next) {
  // Toutes les sauces \\ 
  Sauce.find().then(function (sauce) {
    return res.status(200).json(sauce);
  })["catch"](function (error) {
    return res.status(400).json({
      error: error
    });
  });
};

exports.getOne = function (req, res, next) {
  // Une seule sauce avec id_ dans les paramètres \\ 
  Sauce.findOne({
    _id: req.params.id
  }).then(function (sauce) {
    return res.status(200).json(sauce);
  })["catch"](function (error) {
    return res.status(404).json({
      error: error
    });
  });
};

exports.create = function (req, res, next) {
  var sauceObject = JSON.parse(req.body.sauce);
  var sauce = new Sauce(_objectSpread({}, sauceObject, {
    imageUrl: "".concat(req.protocol, "://").concat(req.get('host'), "/images/").concat(req.file.filename),
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: []
  }));

  if (sauceReg.test(sauce.name) === true && sauceReg.test(sauce.description) === true && sauceReg.test(sauce.manufacturer) === true && sauceReg.test(sauce.mainPepper) === true) {
    sauce.save().then(function () {
      return res.status(201).json({
        message: 'Success create sauce'
      });
    })["catch"](function (error) {
      return res.status(404).json({
        error: error
      });
    });
  } else {
    res.status(400).json({
      message: 'Only characters'
    });
  }
};

exports.editSauce = function (req, res, next) {
  var sauceObject = req.file ? _objectSpread({}, JSON.parse(req.body.sauce), {
    imageUrl: "".concat(req.protocol, "://").concat(req.get('host'), "/images/").concat(req.file.filename)
  }) : _objectSpread({}, req.body);

  if (sauceReg.test(sauceObject.name) === true && sauceReg.test(sauceObject.description) === true && sauceReg.test(sauceObject.manufacturer) === true && sauceReg.test(sauceObject.mainPepper) === true) {
    Sauce.updateOne({
      _id: req.params.id
    }, _objectSpread({}, sauceObject, {
      _id: req.params.id
    })).then(function () {
      return res.status(200).json({
        message: 'Success edit sauce'
      });
    })["catch"](function (error) {
      return res.status(404).json({
        error: error
      });
    });
  } else {
    res.status(400).json({
      message: 'Only characters'
    });
  }
};

exports.deleteSauce = function (req, res, next) {
  Sauce.findOne({
    _id: req.params.id
  }).then(function (Sauce) {
    var fileName = Sauce.imageUrl.split('/images/')[1];
    fs.unlink("images/".concat(fileName), function () {
      Sauce.deleteOne({
        _id: req.params.id
      }).then(function () {
        return res.status(200).json({
          message: 'Success delete sauce'
        });
      })["catch"](function (error) {
        return res.status(400).json({
          error: error
        });
      });
    });
  });
};

exports.likeSauce = function (req, res, next) {
  var likeUser = req.body.like;

  switch (likeUser) {
    case 1:
      Sauce.updateOne({
        _id: req.params.id
      }, {
        $push: {
          usersLiked: req.body.userId
        },
        $inc: {
          likes: +1
        }
      }).then(function () {
        return res.status(200).json({
          message: 'Like'
        });
      })["catch"](function (error) {
        return res.status(400).json({
          error: error
        });
      });
      console.log('Like', req.body);
      break;

    case 0:
      Sauce.findOne({
        _id: req.params.id
      }).then(function (sauce) {
        if (sauce.usersLiked.includes(req.body.userId)) {
          Sauce.updateOne({
            _id: req.params.id
          }, {
            $pull: {
              usersLiked: req.body.userId
            },
            $inc: {
              likes: -1
            }
          }).then(function () {
            return res.status(200).json({
              message: 'Like cancel'
            });
          })["catch"](function (error) {
            return res.status(400).json({
              error: error
            });
          });
        } else if (sauce.usersDisliked.includes(req.body.userId)) {
          Sauce.updateOne({
            _id: req.params.id
          }, {
            $pull: {
              usersDisliked: req.body.userId
            },
            $inc: {
              dislikes: -1
            }
          }).then(function () {
            return res.status(200).json({
              message: 'Dislike cancel'
            });
          })["catch"](function (error) {
            return res.status(400).json({
              error: error
            });
          });
        } else {
          res.status(400).json({
            message: 'Error'
          });
        }
      });
      break;

    case -1:
      Sauce.updateOne({
        _id: req.params.id
      }, {
        $push: {
          usersDisliked: req.body.userId
        },
        $inc: {
          dislikes: +1
        }
      }).then(function () {
        return res.status(200).json({
          message: 'Dislike'
        });
      })["catch"](function (error) {
        return res.status(400).json({
          error: error
        });
      });
      console.log('Dislike');
      break;
  }
};