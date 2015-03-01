var app = require("../app.js");
var events = app.eventEmitter;

events.on("OnChat", function (serverID, data) {
	for (var i in app.Listening) {
		if (app.Listening[i]) {
			if (app.Selected[i] && app.Selected[i][serverID]) {
				app.sendMessage(i, "[" + serverID + "] " + data.name + ": " + data.text);
			}
		}
	}
	app.logger.debug("Server " + serverID + " -> Event: OnChat");
});

events.on("OnLog", function (serverID, data) {
	for (var i in app.Listening) {
		if (app.Listening[i]) {
			if (app.Selected[i] && app.Selected[i][serverID]) {
				app.sendMessage(i, "[" + serverID + "] " + data.text);
			}
		}
	}
	app.logger.debug("Server " + serverID + " -> Event: OnLog");
});

events.on("OnAdminCall", function (serverID, data) {
	for (var i in app.bot.friends) {
		if (app.bot.friends[i] == app.Steam.EFriendRelationship.Friend) {
			app.sendMessage(i, "[Admin Call - Server " + serverID + "] " + data.name + ": " + data.text);
		}
	}
	app.logger.debug("Server " + serverID + " -> Event: OnAdminCall");
});