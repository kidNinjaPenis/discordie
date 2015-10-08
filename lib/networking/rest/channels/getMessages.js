const Constants = require("../../../Constants");
const Events = Constants.Events;
const Endpoints = Constants.Endpoints;
const apiRequest = require("../../../core/ApiRequest");

module.exports = function(channelId, before, after, limit) {
	return new Promise((rs, rj) => {
		apiRequest
		.get(Endpoints.MESSAGES(channelId))
		.auth(this.token)
		.query({
			before: before,
			after: after,
			limit: limit
		})
		.end((err, res) => {
			if(!res.ok)
				return rj(err, res);

			const event = {
				messages: res.body,
				isBefore: before != null,
				isAfter: after != null,
				hasMore: res.body.length === limit
			};
			this.Dispatcher.emit(Events.LOADED_MORE_MESSAGES, event);
			rs(event);
		});
	});
}