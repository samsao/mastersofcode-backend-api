var express = require('express');
var passport = require('passport');
var connectRouter = express.Router();
var router = express.Router();
var dealRouter = express.Router();


var Merchant = require('../model/merchant');
var Deal = require('../model/deal');

connectRouter.get('/test', function (req, res) {
  res.status(200).json({
    message: 'hahahaha'
  });
});

connectRouter.post('/reg', function (req, res) {
  Merchant.findOneAndUpdate({
    phone: req.body.phone
  }, {
      phone: req.body.phone,
      address: req.body.address,
      token: Merchant.genACTK()
    }, {
      upsert: true,
      new: true
    }, function (error, Merchant) {
      if (error) {
        console.error(error);
        return res.status(500).json({
          message: 'internal error'
        });
      }
      return res.status(200).json(Merchant);
    });
});

dealRouter.get('/', passport.authenticate('bearer', {
  session: false
}), function (req, res, next) {
  Deal.find({
    merchant: req.user._id
  }, function (error, deals) {
    if (error) {
      console.error(error);
      return res.status(500).json(error);
    }
    return res.status(200).json(deals);
  });
});

dealRouter.post('/add', passport.authenticate('bearer', {
  session: false
}), function (req, res, next) {
  Deal.create({
    merchant: req.user._id,
    title: req.body.title,
    description: req.body.description,
    originalPrice: req.body.originalPrice,
    price: req.body.price,
    image: req.body.image
  }, function (error, deal) {
    if (error) {
      console.error(error);
      return res.status(500).error(error);
    }
    return res.status(200).json(deal);
  });
});

router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.use('/connect', connectRouter);
router.use('/deal', dealRouter);

module.exports = router;
