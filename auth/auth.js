var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;

var Client = require('../model/client');
var Merchant = require('../model/merchant');

passport.use(new BearerStrategy({
	"passReqToCallback": true
}, function (req, accessToken, done) {
	console.log('HEADER!', req.baseUrl);
	var base = req.baseUrl.split('/')[1];
	console.log('BASE!', base);
	if (base.toLowerCase() === 'Client') {
		Client.findOne({
			token: accessToken
		}, function (error, client) {
			if (error) {
				return done(error);
			}
			if (!client) {
				return done(null, false, {
					message: 'Unknown client'
				});
			}
			var info = {
				scope: '*'
			};
			return done(null, client, info);
		});
	} else if (base.toLowerCase() === 'merchant') {
		Merchant.findOne({
			token: accessToken
		}, function (error, merchant) {
			if (error) {
				return done(error);
			}
			if (!merchant) {
				return done(null, false, {
					message: 'Unknown merchant'
				});
			}
			var info = {
				scope: '*'
			};
			return done(null, merchant, info);
		});
	} else {
		return done(null, false, {
			message: 'Unknown'
		});
	}
}));