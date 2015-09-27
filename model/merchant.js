var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Merchant = new Schema({
	phone: {
		type: String,
		required: true,
		unique: true
	},
	// name: {
	// 	type: String
	// },
	// loc: {
	// 	lng: Number,
	// 	lat: Number
	// },
	address: {
		type: String
	}
});

module.exports = mongoose.model('Merchant', Merchant);