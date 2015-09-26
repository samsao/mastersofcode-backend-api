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
	price: {
		type: Number
	},
	image: {
		type: String
	},
	transactions:[{
		type: Schema.Types.ObjectId,
		ref: 'Transaction'
	}]
});

module.exports = mongoose.model('Deal', Deal);