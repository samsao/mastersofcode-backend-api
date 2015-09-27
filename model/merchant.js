var mongoose = require('mongoose');
var crypto = require('crypto');
var fs = require('fs');
var keyPath = './key.pem';
var pem = fs.readFileSync(keyPath);
var key = pem.toString('ascii');

var Schema = mongoose.Schema;

var Merchant = new Schema({
	phone: {
		type: String,
		required: true,
		unique: true
	},
	place: {
		name: {
			type: String
		},
		id: {
			type: String
		}
	},
	token: {
		type: String,
		unique: true
	},
	gcmId: {
		type: String
	}
});

Merchant.statics.genACTK = function genACTK() {
	var hmac = crypto.createHmac('sha1', key);
	hmac.update('' + Date.now() + crypto.randomBytes(128));
	return hmac.digest('base64').replace(/\+/g, '').replace(/\//g, '').replace(/=/g, '');
}

module.exports = mongoose.model('Merchant', Merchant);