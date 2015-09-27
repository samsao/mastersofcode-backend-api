var mongoose = require('mongoose');
var fs = require('fs');
var crypto = require('crypto');
var keyPath = './key.pem';
var pem = fs.readFileSync(keyPath);
var key = pem.toString('ascii');

var Schema = mongoose.Schema;

var Transaction = new Schema({
	client: {
		type: Schema.Types.ObjectId,
		ref: 'Client',
		required: true
	},
	deal: {
		type: Schema.Types.ObjectId,
		ref: 'Deal',
		required: true
	},
	merchant: {
		type: Schema.Types.ObjectId,
		ref: 'Merchant',
		required: true
	},
	key: {
		type: String,
		required: true,
		unique: true
	},
	amount: {
		type: Number,
	},
	reference: {
		type: String,
	},
	status: {
		/* 0 for Authorization
		 * 1 for we're holding the money
		 * 2 for paid to merchant 
		 */
		type: Number,
		default: 0
	},
	paymentAuthorizationId: {
		type: String,
		required: true,
		unique: true
	},
	paymentStatus: {
		type: String,
		enum: 'APPROVED DECLINED'.split(' ')
	}
});

Transaction.statics.genKey = function (data) {
	var hmac = crypto.createHmac('sha1', key);
	hmac.update(data);
	return hmac.digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '.');
};

module.exports = mongoose.model('Transaction', Transaction);