addCommand("servers", false, function (steamID, name, args) {
	var text = "Servers:";

	for (var i in servers) {
		text = text + "\n    " + i + ". " + servers[i].name;
	};

	sendMessage(steamID, text);
	console.log(name + " requested the servers list.");
})

addCommand("ping", false, function (steamID, name, args) {
	sendMessage(steamID, "Pong!");
})

addCommand("who", false, function (steamID, name, args) {
	var admin = "No";

	if (isAdmin(steamID)) {
		admin = "Yes";
	}

	var text = "\nName: " + name + "\nSteamID64: " + steamID + "\nAdmin: " + admin;

	sendMessage(steamID, text);
})

addCommand("select", false, function (steamID, name, args) {
	var selectWork = [];

	for (var i in args) {
		if (args[0] == "*") {
			for (var k in servers) {
				selectWork.push(k);
			}
			break;
		}

		var id = Number(args[i]);

		if (!isNaN(args[i]) && id > 0 && id === parseInt(id, 10) && servers[id]) {
			selectWork.push(id);
		}
	}

	selected[steamID] = selectWork;

	if (selectWork.length > 0) {
		if (selectWork.length != servers.length) {
			var text = "You have selected server ";

			for (var i in selectWork) {
				text = text + selectWork[i] + ", ";
			}

			text = text + ".";

			sendMessage(steamID, text);
		} else {
			sendMessage(steamID, "All servers were selected.");
		}
	} else {
		sendMessage(steamID, "The server(s) you have selected couldn't be found.");
	}
})