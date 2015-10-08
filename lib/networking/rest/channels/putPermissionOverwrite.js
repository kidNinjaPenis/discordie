const Constants = require("../../../Constants");
const Events = Constants.Events;
const Endpoints = Constants.Endpoints;
const apiRequest = require("../../../core/ApiRequest");

module.exports = function(channelId, overwrite) {
	return new Promise((rs, rj) => {
		apiRequest
		.put(`${Endpoints.CHANNEL_PERMISSIONS(channelId)}/${overwrite.id}`)
		.auth(this.token)
		.send({overwrite: overwrite})
		.end((err, res) => {
			return res.ok ? rs() : rj(err, res);
		});
	});
}