var express = require('express');
var router = express.Router();
var connect = express.Router();
var Merchant = require('../model/merchant');

connect.get('/test', function (req, res) {
  res.status(200).json({
    message: 'hahahaha'
  });
});

connect.post('/reg', function (req, res) {
  Merchant.findOneAndUpdate({
    phone: req.query.phone
  },{
      phone: req.body.phone,
      address: req.body.address
    }, {
      upsert: true,
      new: true
    }, function (error, Merchant) {
      if (error) {
        return res.status(500).json({
          message: 'internal error'
        });
      }
      Merchant.token = Merchant.genACTK();
      Merchant.save(function (error) {
        if (error) {
          console.error(error);
          return res.status(500).json(error);
        }
        return res.status(200).json(Merchant);
      });

    });
});


router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.use('/connect', connect);

module.exports = router;
