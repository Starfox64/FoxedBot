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

addCommand("showargs", false, function (steamID, name, args) {
	var text = args.length + " arguments:";

	for (var i in args) {
		text = text + "\n" + args[i];
	}

	sendMessage(steamID, text);
})

addCommand("select", false, function (steamID, name, args) {
	var selectWork = [];

	for (var i in args) {
		if (args[i] == "*") {
			for (var k in servers) {
				selectWork.push(k);
			}
			break;
		}

		var id = Number(args[i]);

		if (!isNaN(args[i]) && id >= 0 && servers[id]) {
			selectWork.push(id);
		}
	}

	selected[steamID] = selectWork;

	if (selectWork.length > 0) {
		if (selectWork.length != servers.length) {
			var text = "You have selected server ";

			for (var i in selectWork) {
				text = text + selectWork[i];
				if (Number(i) + 1 != selectWork.length) {
					text = text + ", ";
				}
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

addCommand("chat", false, function (steamID, name, args) {
	if (selected[steamID] && selected[steamID].length > 0) {
		var text = "";

		for (var i in args) {
			text = text + " " + args[i];
		}
		if (text != "" || text != " ") {
			var data = {
				name: name,
				message: text
			}
			for (var i in selected[steamID]) {
				sendToServer(selected[steamID][i], "chat", data);
			}
		}
	} else {
		sendMessage(steamID, "You need to select a server first!");
	}
})