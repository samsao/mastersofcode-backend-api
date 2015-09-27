var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;

var Client = require('../model/client');

passport.use(new BearerStrategy({
	"passReqToCallback": true
}, function (req, accessToken, done) {
	console.log(req.baseUrl);
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
}));