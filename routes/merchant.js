var express = require('express');
var passport = require('passport');
var multer = require('multer');
var async = require('async');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.cwd() + '/uploads/');
  },
  filename: function (req, file, cb) {
    var ext = file.originalname.split('.').pop();
    cb(null, file.fieldname + '-' + Date.now() + '.' + ext);
  }
});
var upload = multer({ storage: storage });
var Simplify = require('simplify-commerce');

var simplifyClient = Simplify.getClient({
  publicKey: 'sbpb_ZmE4OGEwNzAtZGQ0Yi00OGQyLWIwY2QtNzM0YTE0YzNjNGNi',
  privateKey: 'RF3y6TCNi2bgWDJNbA2nCLZX2ejIa0hpJR4wHk+qoIJ5YFFQL0ODSXAOkNtXTToq'
});

var gcm = require('../class/gcm');

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
      gcmId: req.body.gcmId,
      token: Merchant.genACTK()
    }, {
      upsert: true,
      new: true
    }, function (error, merchant) {
      if (error) {
        console.error(error);
        return res.status(500).json({
          message: 'internal error'
        });
      }
      return res.status(200).json(merchant);
    });
});

connectRouter.put('/', passport.authenticate('bearer', {
  session: false
}), function (req, res, next) {
  Merchant.findById(req.user._id, function (error, merchant) {
    if (error) {
      console.error(error);
      return res.status(500).json({
        message: 'internal error'
      });
    }
    if (req.body.gcmId) {
      merchant.gcmId = req.body.gcmId;
    }
    if (req.body.phone) {
      merchant.phone = req.body.phone;
    }
    if (req.body.placeId) {
      merchant.place.id = req.body.placeId;
    }
    if (req.body.placeName) {
      merchant.place.name = req.body.placeName;
    }
    merchant.save(function (error) {
      if (error) {
        console.error(error);
        return res.status(500).json({
          message: 'internal error'
        });
      }
      return res.status(200).json(merchant);
    });
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

dealRouter.post('/add', upload.single('imageFile'), passport.authenticate('bearer', {
  session: false
}), function (req, res, next) {
  Deal.create({
    merchant: req.user._id,
    title: req.body.title,
    description: req.body.description,
    originalPrice: req.body.originalPrice,
    price: req.body.price,
    image: req.file.filename,
    quantity: req.body.quantity
  }, function (error, deal) {
    if (error) {
      console.error(error);
      return res.status(500).error(error);
    }
    gcm.sendClientNotification();
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
  Transaction.findOne({
    key: req.body.key
  }, function (error, transaction) {
    if (error) {
      console.error(error);
      return res.status(500).json(error);
    }
    if (!transaction) {
      return res.status(404).json({
        message: 'transaction not found'
      });
    }
    if (transaction.status) {
      return res.status(403).json({
        message: 'key has been used already'
      });
    }
    if (transaction.merchant.toString() != req.user._id.toString()) {
      console.log(transaction.merchant, req.user._id)
      return res.status(403).json({
        message: 'Wrong merchant'
      });
    }
    transaction.status = 1;
    console.log('transaction', transaction);
    console.log('amount', transaction.amount);
    console.log('paymentStatus', transaction.paymentStatus);
    simplifyClient.payment.create({
      amount: transaction.amount,
      // description: "shipment of two eggs in a glass bottle",
      authorization: transaction.paymentAuthorizationId,
      reference: transaction.reference,
      currency: "USD"
    }, function (errData, data) {
      if (errData) {
        console.error("Error Message: ", errData.data);
        return res.status(400).json(errData.data.error);
      }
      transaction.save();
      console.log("Payment Status: " + data.paymentStatus);
      return res.status(200).json(transaction);
    });
  });
});

router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// var sendMoney = function sendMoney() {
//   var cardMappingServiceClass = require('./mastercard-api-node/services/moneysend/CardMappingService');
//   var environment = require('./mastercard-api-node/common/Environment');
// };

router.post('/withdraw', passport.authenticate('bearer', {
  session: false
}), function (req, res) {
  Transaction.find({
    merchant: req.user._id
  }, function (error, transactions) {
    var total = 0;
    async.each(transactions, function (transaction, callback) {
      transactions.status = 2;
      transaction.save(function (error) {
        if (error) {
          callback(error);
        }
        total += transaction.amount;
        callback();
      });
    }, function (error) {
      if (error) {
        console.error(error);
        return res.status(500).json(error);
      }
      sendMoney(total);
      return res.status(200).json({
        moneySent: total
      });
    });
  });
});

router.use('/connect', connectRouter);
router.use('/deal', dealRouter);
router.use('/transaction', transactionRouter);

module.exports = router;
