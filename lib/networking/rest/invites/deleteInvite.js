const Constants = require("../../../Constants");
const Events = Constants.Events;
const Endpoints = Constants.Endpoints;
const apiRequest = require("../../../core/ApiRequest");

module.exports = function(code) {
	return new Promise((rs, rj) => {
		apiRequest
		.del(`${Endpoints.INVITE}/${code}`)
		.auth(this.token)
		.end((err, res) => {
			// todo: invite collection handling
			return res.ok ? rs() : rj(err, res);
		});
	});
}