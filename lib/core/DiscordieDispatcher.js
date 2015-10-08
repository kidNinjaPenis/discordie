"use strict";

const events = require("events");

class DiscordieDispatcher extends events.EventEmitter {
	constructor() {
		super();
		this._anyeventlisteners = [];
	}
	onAny(fn) {
		if (typeof fn !== "function")
			return;
		this._anyeventlisteners.push(fn);
	}
	emit(eventType) {
		if (!eventType)
			throw new DiscordieError("Event type is " + (typeof eventType));

		super.emit.apply(this, arguments);
		const _arguments = arguments;
		this._anyeventlisteners.forEach((fn) => {
			fn.apply(null, _arguments);
		});
	}
}

module.exports = DiscordieDispatcher;