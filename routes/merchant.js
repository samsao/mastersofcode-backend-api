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


var Merchant = require('../model/merchant');
var Deal = require('../model/deal');
var Transaction = require('../model/transaction');

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
    image: req.body.image,
    quantity: req.body.quantity
  }, function (error, deal) {
    if (error) {
      console.error(error);
      return res.status(500).error(error);
    }
    return res.status(200).json(deal);
  });
});

dealRouter.get('/:dealId', passport.authenticate('bearer', {
  session: false
}), function (req, res, next) {
  /// TODO check this deal is belong to this merchant
  Deal.findById(req.params.dealId).populate('transactions').exec(function (error, transactions) {
    if (error) {
      console.error(error);
      return res.status(500).json(error);
    }
    return res.status(200).json(transactions);
  });
});

dealRouter.put('/:dealId', passport.authenticate('bearer', {
  session: false
}), function (req, res, next) {
  Deal.findById(req.params.dealId, function (error, deal) {
    if (error) {
      console.error(error);
      return res.status(500).json(error);
    }
    if (!deal) {
      return res.status(404).json({
        message: 'deal not found'
      });
    }
    if (req.body.title) {
      deal.title = req.body.title;
    }
    if (req.body.description) {
      deal.description = req.body.description;
    }
    if (req.body.originalPrice) {
      deal.originalPrice = req.body.originalPrice;
    }
    if (req.body.price) {
      deal.price = req.body.price;
    }
    if (req.body.image) {
      deal.image = req.body.image;
    }
    if (req.body.quantity) {
      deal.quantity = req.body.quantity;
    }
    deal.save(function (error) {
      if (error) {
        console.error(error);
        return res.status(500).json(error);
      }
      return res.status(200).json(deal);
    })
  });
});

transactionRouter.post('/complete', passport.authenticate('bearer', {
  session: false
}), function (req, res, next) {
  
});

router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.use('/connect', connectRouter);
router.use('/deal', dealRouter);
router.use('/transaction', transactionRouter);

module.exports = router;
