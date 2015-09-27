var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Deal = new Schema({
	merchant: {
		type: Schema.Types.ObjectId,
		ref: 'Merchant',
		required: true
	},
	title: {
		type: String,
		required: true
	},
	description: {
		type: String
	},
	originalPrice: {
		type: Number
	},
	price: {
		type: Number
	},
	image: {
		type: String
	},
	quantity: {
		type: Number,
		default: 0
	},
	transactions:[{
		type: Schema.Types.ObjectId,
		ref: 'Transaction'
	}]
});

module.exports = mongoose.model('Deal', Deal);