var express = require('express');
var router = express.Router();
var connect = express.Router();
var Client = require('../model/client');

connect.get('/test', function (req, res) {
  res.status(200).json({
    message: 'hahahaha'
  });
});

connect.get('/login', function (req, res) {
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

connect.post('/reg', function (req, res) {
  Client.create({
    phone: req.body.phone,
    gcmId: req.body.gcmId
  }, function(error, client){
    if (error){
      console.error(error);
      return res.status(500).json(error);
    }
    client.token = client.genACTK();
    client.save(function(error){
      if(error){
        console.error(error);
        return res.status(500).json(error);
      }
      return res.status(200).json(client);
    })
  });
});


router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.use('/connect', connect);

module.exports = router;
