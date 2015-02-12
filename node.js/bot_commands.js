addCommand("servers", false, function (steamID, name, args) {
	var text = "Servers:";

	for (var i in servers) {
		text = text + "\n    " + i + ". " + servers[i].name;
	};

	sendMessage(steamID, text);
});

addCommand("ping", false, function (steamID, name, args) {
	sendMessage(steamID, "Pong!");
});

addCommand("who", false, function (steamID, name, args) {
	var admin = "No";

	if (isAdmin(steamID)) {
		admin = "Yes";
	}

	var text = "\nName: " + name + "\nSteamID64: " + steamID + "\nAdmin: " + admin;

	sendMessage(steamID, text);
});

addCommand("adduser", true, function (steamID, name, args) {
	if (!isNaN(args[0])) {
		bot.addFriend(args[0]);
		console.log(name + " added " + args[0] + ".")
	} else {
		sendMessage(steamID, "Please enter a valid SteamID64!");
	}
});

addCommand("deluser", true, function (steamID, name, args) {
	if (!isNaN(args[0])) {
		bot.removeFriend(args[0]);
		console.log(name + " removed " + args[0] + ".")
	} else {
		sendMessage(steamID, "Please enter a valid SteamID64!");
	}
});

addCommand("admin", false, function (steamID, name, args) {
	var text = "";

	for (var i in args) {
		text = text + " " + args[i];
	}
	
	if (text != "" && text != " ") {
		for (var i in bot.friends) {
			sendMessage(i, "[Admin Chat] " + name + ": " + text);
		}
	}
});

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
			selectWork[id] = true;
		}
	}

	if (selectWork.length > 0) {
		if (selectWork.length != servers.length) {
			var text = "You have selected server ";

			for (var i in selectWork) {
				text = text + i;
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
		return;
	}

	selected[steamID] = selectWork;
});

addCommand("listen", false, function (steamID, name, args) {
	if (listening[steamID]) {
		listening[steamID] = false;
		sendMessage(steamID, "You have stopped listening to all servers.");
	} else {
		listening[steamID] = true;
		sendMessage(steamID, "You are now listening to all selected servers.");
	}
});

addCommand("mute", false, function (steamID, name, args) {
	if (muted[steamID]) {
		muted[steamID] = false;
		sendMessage(steamID, "FoxedBot is no longer muted.");
	} else {
		sendMessage(steamID, "FoxedBot is now muted.");
		muted[steamID] = true;
	}
});

addCommand("chat", false, function (steamID, name, args) {
	if (selected[steamID] && selected[steamID].length > 0) {
		var text = "";

		for (var i in args) {
			text = text + " " + args[i];
		}

		if (text != "" && text != " ") {
			var data = {
				name: name,
				message: text
			}
			for (var i in selected[steamID]) {
				sendToServer(i, "OnChat", data);
			}
		}
	} else {
		sendMessage(steamID, "You need to select a server first!");
	}
});

addCommand("announce", false, function (steamID, name, args) {
	if (selected[steamID] && selected[steamID].length > 0) {
		var text = "";

		for (var i in args) {
			text = text + " " + args[i];
		}

		if (text != "" && text != " ") {
			var data = {
				message: text
			}
			for (var i in selected[steamID]) {
				sendToServer(i, "OnAnnounce", data);
			}
		}
	} else {
		sendMessage(steamID, "You need to select a server first!");
	}
});

addCommand("getplayers", false, function (steamID, name, args) {
	if (selected[steamID] && selected[steamID].length > 0) {
		var data = {
			steamID: steamID
		}

		for (var i in selected[steamID]) {
			sendToServer(i, "GetPlayers", data);
		}
	} else {
		sendMessage(steamID, "You need to select a server first!");
	}
});

addCommand("rcon", true, function (steamID, name, args) {
	if (selected[steamID] && selected[steamID].length > 0) {
		var text = "";

		for (var i in args) {
			text = text + " " + args[i];
		}

		if (text != "" && text != " ") {
			var data = {
				steamID: steamID,
				command: text
			}
			for (var i in selected[steamID]) {
				sendToServer(i, "OnRCON", data);
			}
		}
	} else {
		sendMessage(steamID, "You need to select a server first!");
	}
});

addCommand("kick", false, function (steamID, name, args) {
	if (selected[steamID] && selected[steamID].length > 0) {
		var reason;
		if (!args[0]) {
			sendMessage(steamID, "You need to specify a name.");
			return;
		}

		if (!args[1]) {
			reason = "Kicked by FoxedBot";
		} else {
			reason = args[1];
		}

		var data = {
			steamID: steamID,
			name: args[0],
			reason: reason
		}

		for (var i in selected[steamID]) {
			sendToServer(i, "OnKick", data);
		}
	} else {
		sendMessage(steamID, "You need to select a server first!");
	}
});

addCommand("kickid", false, function (steamID, name, args) {
	if (selected[steamID] && selected[steamID].length > 0) {
		var reason;
		if (!args[0]) {
			sendMessage(steamID, "You need to specify a UserID.");
			return;
		}

		if (isNaN(args[0])) {
			sendMessage(steamID, "Argument #1 needs to be a number!");
			return;
		}

		if (!args[1]) {
			reason = "Kicked by FoxedBot";
		} else {
			reason = args[1];
		}

		var data = {
			steamID: steamID,
			userID: Number(args[0]),
			reason: reason
		}

		for (var i in selected[steamID]) {
			sendToServer(i, "OnKickID", data);
		}
	} else {
		sendMessage(steamID, "You need to select a server first!");
	}
});

addCommand("ban", false, function (steamID, name, args) {
	if (selected[steamID] && selected[steamID].length > 0) {
		var time;
		var reason;
		if (!args[0]) {
			sendMessage(steamID, "You need to specify a name.");
			return;
		}

		if (!args[1]) {
			time = 0;
		} else {
			if (isNaN(args[1])) {
				sendMessage(steamID, "Argument #2 needs to be a number!");
				return;
			} else {
				time = Number(args[1]);
			}
		}

		if (!args[2]) {
			reason = "Banned by FoxedBot";
		} else {
			reason = args[2];
		}

		var data = {
			steamID: steamID,
			name: args[0],
			time: time,
			reason: reason
		}

		for (var i in selected[steamID]) {
			sendToServer(i, "OnBan", data);
		}
	} else {
		sendMessage(steamID, "You need to select a server first!");
	}
});

addCommand("banid", false, function (steamID, name, args) {
	if (selected[steamID] && selected[steamID].length > 0) {
		var time;
		var reason;
		if (!args[0]) {
			sendMessage(steamID, "You need to specify a SteamID.");
			return;
		}

		if (!args[1]) {
			time = 0;
		} else {
			if (isNaN(args[1])) {
				sendMessage(steamID, "Argument #2 needs to be a number!");
				return;
			} else {
				time = Number(args[1]);
			}
		}

		if (!args[2]) {
			reason = "Banned by FoxedBot";
		} else {
			reason = args[2];
		}

		var data = {
			steamID: steamID,
			target: args[0],
			time: time,
			reason: reason
		}

		for (var i in selected[steamID]) {
			sendToServer(i, "OnBanID", data);
		}
	} else {
		sendMessage(steamID, "You need to select a server first!");
	}
});

addCommand("unban", false, function (steamID, name, args) {
	if (selected[steamID] && selected[steamID].length > 0) {
		if (!args[0]) {
			sendMessage(steamID, "You need to specify a SteamID.");
			return;
		}

		var data = {
			steamID: steamID,
			target: args[0]
		}

		for (var i in selected[steamID]) {
			sendToServer(i, "OnUnban", data);
		}
	} else {
		sendMessage(steamID, "You need to select a server first!");
	}
});