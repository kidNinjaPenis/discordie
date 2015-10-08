"use strict";

const fork = require("child_process").fork;
const EncoderWorker = require("./threading/EncoderWorker");

const defaultOptions = {
	multiThreadedVoice: false,
};

class AudioScheduler {
	constructor(voicews, options) {
		if (!options) options = defaultOptions;

		this.voicews = voicews;
		this.onNeedBuffer = function() {};

		if (options.multiThreadedVoice) {
			this.worker = fork(__dirname + "/threading/EncoderWorker");
		} else {
			this.worker = new EncoderWorker();
		}

		this.initialize(options);

		this.worker.on("message", (msg) => {
			switch (msg.op) {
			case "needbuffer":
				if (typeof this.onNeedBuffer === "function")
					this.onNeedBuffer();
				break;
			case "opuspacket":
				if (voicews.connected && !voicews.audioTransportSocket)
					throw new Error("No transport");

				if (!voicews.connected) break;
				if (!msg.packet) break;

				var packetData = msg.packet.data;
				if (msg.packet.constructor.name == "Buffer")
					packetData = msg.packet;

				voicews.audioTransportSocket
					.send(packetData, msg.sampleCount);
				break;
			}
		});
	}
	initialize(options) {
		if (!options) options = defaultOptions;
		this.worker.send({
			op: "initialize",
			options
		});

		this.onNeedBuffer = function() {};
	}
	setVolume(volume) {
		this.worker.send({
			op: "set",
			key: "volume",
			value: volume
		});
	}
	enqueue(chunk, sampleCount) {
		this.worker.send({
			op: "enqueue",
			frame: {
				chunk: chunk,
				sampleCount: sampleCount
			}
		});
	}
	kill() {
		this.worker.kill();
	}
}

module.exports = AudioScheduler;