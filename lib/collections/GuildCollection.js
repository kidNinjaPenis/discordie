"use strict";

const Constants = require("../Constants");
const Events = Constants.Events;
const Utils = require("../core/Utils");
const BaseCollection = require("./BaseCollection");

const Guild = require("../models/Guild");

function convertRoles(roles) {
	const map = new Map();
	roles.forEach(role => {
		map.set(role.id, role);
	});
	return map;
}

function createGuild(guild) {
	return new Guild({
		id: guild.id,
		name: guild.name,
		region: guild.region,
		icon: guild.icon,
		owner_id: guild.owner_id,
		roles: convertRoles(guild.roles),
		afk_channel_id: guild.afk_channel_id,
		afk_timeout: guild.afk_timeout,
		joined_at: guild.joined_at
	});
}

function handleConnectionOpen(data) {
	this.clear();
	data.guilds.forEach(guild => {
		if (guild.unavailable) return;
		this.set(guild.id, createGuild(guild));
	});
	return true;
}

function handleCreateOrUpdateGuild(guild) {
	if (guild.unavailable) return;
	this.mergeOrSet(guild.id, createGuild(guild));
	return true;
}

function handleDeleteGuild(guild) {
	this.delete(guild.id);
	return true;
}

function handleGuildRoleCreateOrUpdate(data) {
	let guild = this.get(data.guild_id);
	if (guild)
		guild.roles.set(data.role.id, data.role);
	return true;
}

function handleGuildRoleDelete(data) {
	let guild = this.get(data.guild_id);
	if (guild)
		guild.roles.delete(data.role_id);
	return true;
}


class GuildCollection extends BaseCollection {
	constructor(discordie, gateway) {
		super();

		if (typeof gateway !== "function")
			throw new Error("Gateway parameter must be a function");

		discordie.Dispatcher.on(Events.GATEWAY_READY, e => {
			if (e.socket != gateway()) return;
			(handleConnectionOpen.bind(this))(e.data);
		});
		discordie.Dispatcher.on(Events.GATEWAY_DISPATCH, e => {
			if (e.socket != gateway()) return;

			Utils.bindGatewayEventHandlers(this, e, {
				GUILD_CREATE: handleCreateOrUpdateGuild,
				GUILD_UPDATE: handleCreateOrUpdateGuild,
				GUILD_DELETE: handleDeleteGuild,
				GUILD_ROLE_CREATE: handleGuildRoleCreateOrUpdate,
				GUILD_ROLE_UPDATE: handleGuildRoleCreateOrUpdate,
				GUILD_ROLE_DELETE: handleGuildRoleDelete
			});
		});

		this._discordie = discordie;
		Utils.privatify(this);
	}
}

module.exports = GuildCollection;