'use strict';
var express = require('express');
var passport = require('passport');
var Simplify = require('simplify-commerce');
var simplifyClient = Simplify.getClient({
  publicKey: 'sbpb_ZmE4OGEwNzAtZGQ0Yi00OGQyLWIwY2QtNzM0YTE0YzNjNGNi',
  privateKey: 'RF3y6TCNi2bgWDJNbA2nCLZX2ejIa0hpJR4wHk+qoIJ5YFFQL0ODSXAOkNtXTToq'
});

var router = express.Router();
var connectRouter = express.Router();
var dealRouter = express.Router();
var transactionRouter = express.Router();

var Client = require('../model/client');
var Deal = require('../model/deal');
var Transaction = require('../model/transaction');

var gcm = require('../class/gcm');

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
  Deal.find({}).populate('merchant').sort({_id: -1}).exec(function (error, deals) {
    if (error) {
      console.error(error);
      return res.status(500).json(error);
    }
    return res.status(200).json(deals);
  });
});

transactionRouter.get('/', passport.authenticate('bearer', {
  session: false
}), function (req, res, next) {
  Transaction.find({
    client: req.user._id
  }).populate('deal').exec(function (error, transactions) {
    if (error) {
      console.error(error);
      return res.status(500).json(error);
    }
    return res.status(200).json(transactions);
  });
});

transactionRouter.get('/:transactionId', passport.authenticate('bearer', {
  session: false
}), function (req, res, next) {
  Transaction.findById(req.params.transactionId, function (error, transaction) {
    if (error) {
      console.error(error);
      return res.status(500).json(error);
    }
    return res.status(200).json(transaction);
  });
});

transactionRouter.post('/add', passport.authenticate('bearer', {
  session: false
}), function (req, res, next) {
  Deal.findById(req.body.deal, function (error, deal) {
    if (error) {
      console.error(error);
      return res.status(500).json(error);
    }
    if (!deal) {
      console.log('deal', req.body.deal);
      return res.status(404).json({
        message: 'deal not found'
      });
    }
    if (req.body.quantity > deal.quantity) {
      return res.status(403).json({
        message: 'you bought too much'
      });
    }
    simplifyClient.authorization.create({
      amount: deal.price * req.body.quantity * 100,
      token: req.body.token,
      description: "payment description",
      reference: deal._id,
      currency: "USD"
    }, function (errData, data) {
      if (errData) {
        console.error("Error Message: " + errData.data.error.message);
        // handle the error
        return res.status(400).json(errData.data.error);
      }
      console.log("Success Response: " + JSON.stringify(data));
      Transaction.create({
        client: req.user._id,
        deal: deal._id,
        merchant: deal.merchant,
        paymentAuthorizationId: data.id,
        paymentStatus: data.paymentStatus,
        amount: data.amount,
        reference: data.reference,
        key: Transaction.genKey('' + req.user._id + deal._id + Date.now()),
      }, function (error, transaction) {
        if (error) {
          console.error(error);
          return res.status(500).json(error);
        }
        deal.transactions.push(transaction._id);
        deal.quantity -= req.body.quantity;
        deal.save();
        gcm.sendMerchantNotification(deal._id, 1);
        return res.status(200).json(transaction);
      });
    });
  });
});

router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.use('/connect', connectRouter);
router.use('/deal', dealRouter);
router.use('/transaction', transactionRouter);

module.exports = router;
