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
  Deal.find()
})

router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.use('/connect', connectRouter);

module.exports = router;
