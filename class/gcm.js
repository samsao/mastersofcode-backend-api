var gcm = require('node-gcm');

var Deal = require('../model/deal');
var Client = require('../model/client');

var senderMerchant = new gcm.Sender('AIzaSyAqlOm3cNRP6f8cjJI6pku1ZfLuZQSxK6k');
var senderClient = new gcm.Sender('AIzaSyCXD3FD4tAckwET_xmrR7ABC4X4S5aXUMA');

gcm.sendClientNotification = function () {
	Client.find({}, {
		gcmId: 1,
		_id: 0
	}, function (error, clients) {
		if (error) {
			console.error(error);
			return;
		}
		var notificationIdList = [];
		clients.forEach(function (client) {
			notificationIdList.push(client.gcmId);
		});
		var message = new gcm.Message({
			notification: {
				title: "There's a new deal!",
				icon: "ic_launcher",
				sound: "default"
			}
		});
		senderClient.send(message, {
			registrationIds: notificationIdList
		}, function (error, result) {
			console.log('???????????????????@@/');
			if (error){
				console.error('GCM error!!!!!',error);
			}
			else
				console.log(result);
		});
	});
}

gcm.sendMerchantNotification = function (dealId) {
	console.log('dealId', dealId);
	Deal.findById(dealId).populate('merchant').exec(function (error, deal) {
		if (error) {
			return console.error(error);
		}
		var message = new gcm.Message({
			notification: {
				title: "There's a new transaction!",
				icon: "ic_launcher",
				sound: "default"
			},
			data: {
				deal: dealId
			}
		});
		console.log('DDDDDDDDDDeal', deal);
		senderMerchant.send(message, [deal.merchant.gcmId], function (error, result) {
			if (error)
				console.error(error);
			else
				console.log(result);
		});
	});
}

module.exports = gcm;