'use strict';
var express = require('express');
var router = express.Router();
var passport = require('passport');

var connectRouter = express.Router();
var dealRouter = express.Router();

var Client = require('../model/client');
var Deal = require('../model/deal');

connectRouter.get('/test', function (req, res) {
  res.status(200).json({
    message: 'hahahaha'
  });
});

connectRouter.get('/login', function (req, res) {
  Client.findOne({
    phone: req.query.phone
  }, function (error, client) {
    console.log('phone', req.query.phone);
    if (error) {
      return res.status(500).json({
        message: 'internal error'
      });
    }
    if (!client) {
      return res.status(404).json({
        message: 'not exist'
      });
    }
    return res.status(200).json(client);
  });
});

connectRouter.post('/reg', function (req, res) {
  Client.findOneAndUpdate({
    phone: req.body.phone,
  }, {
      phone: req.body.phone,
      gcmId: req.body.gcmId,
      token: Client.genACTK()
    }, {
      upsert: true,
      new: true
    }, function (error, client) {
      if (error) {
        console.error(error);
        return res.status(500).json(error);
      }
      return res.status(200).json(client);
    });
});

dealRouter.get('/', passport.authenticate('bearer', {
  session: false
}), function (req, res, next) {
  Deal.find({}, function (error, deals) {
    if (error) {
      console.error(error);
      return res.status(500).json(error);
    }
    return res.status(200).json(deals);
  });
});

router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.use('/connect', connectRouter);
router.use('/deal', dealRouter);

module.exports = router;
