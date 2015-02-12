addEvent("OnChat", function (serverID, data) {
	for (var i in listening) {
		if (listening[i]) {
			if (selected[i] && selected[i][serverID]) {
				sendMessage(i, "[" + serverID + "] " + data.name + ": " + data.text);
			}
		}
	}
});

addEvent("OnLog", function (serverID, data) {
	for (var i in listening) {
		if (listening[i]) {
			if (selected[i] && selected[i][serverID]) {
				sendMessage(i, "[" + serverID + "] " + data.text);
			}
		}
	}
});

addEvent("OnAdminCall", function (serverID, data) {
	for (var i in bot.friends) {
		if (bot.friends[i] == Steam.EFriendRelationship.Friend) {
			sendMessage(i, "[Admin Call - Server " + serverID + "] " + data.name + ": " + data.text);
		}
	}
});