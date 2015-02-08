addEvent("OnChat", function (serverID, data) {
	for (var i in listening) {
		if (listening[i]) {
			if (selected[i] && selected[i][serverID]) {
				sendMessage(i, "[" + serverID + "] " + data.name + ": " + data.text);
			}
		}
	}
});