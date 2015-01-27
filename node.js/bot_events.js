addEvent("OnChat", function (serverID, data) {
	console.log("[" + serverID + "] " + data.name + ": " + data.text);
})