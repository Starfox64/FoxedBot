var app = require("../app.js");
app.on = app.eventEmitter.on;

app.on("OnChat", function (serverID, data) {
	for (var i in app.Listening) {
		if (app.Listening[i]) {
			if (app.Selected[i] && app.Selected[i][serverID]) {
				app.sendMessage(i, "[" + serverID + "] " + data.name + ": " + data.text);
			}
		}
	}
});

app.on("OnLog", function (serverID, data) {
	for (var i in app.Listening) {
		if (app.Listening[i]) {
			if (app.Selected[i] && app.Selected[i][serverID]) {
				app.sendMessage(i, "[" + serverID + "] " + data.text);
			}
		}
	}
});

app.on("OnAdminCall", function (serverID, data) {
	for (var i in bot.friends) {
		if (bot.friends[i] == Steam.EFriendRelationship.Friend) {
			app.sendMessage(i, "[Admin Call - Server " + serverID + "] " + data.name + ": " + data.text);
		}
	}
});