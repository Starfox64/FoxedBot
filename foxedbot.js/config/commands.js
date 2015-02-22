var Config = require("./settings.js");
var func = require("../lib/functions.js");
var app = require("../app.js");

app.addCommand("help", false, function (steamID, name, args) {
	var text = "Available commands:";

	for (var i in app.Commands) {
		text = text + "\n    - " + i;
	};

	app.sendMessage(steamID, text);
});

app.addCommand("servers", false, function (steamID, name, args) {
	var text = "Servers:";

	for (var i in Config.servers) {
		text = text + "\n    " + i + ". " + Config.servers[i].name;
	};

	app.sendMessage(steamID, text);
});

app.addCommand("ping", false, function (steamID, name, args) {
	app.sendMessage(steamID, "Pong!");
});

app.addCommand("who", false, function (steamID, name, args) {
	var admin = "No";

	if (func.isAdmin(steamID)) {
		admin = "Yes";
	}

	var text = "\nName: " + name + "\nSteamID64: " + steamID + "\nAdmin: " + admin;

	app.sendMessage(steamID, text);
});

app.addCommand("friends", true, function (steamID, name, args) {
	var text = "Friends:";

	for (var i in app.bot.friends) {
		if (app.bot.friends[i] == app.Steam.EFriendRelationship.Friend) {
			if (app.bot.users[i]) {
				text = text + "\n[" + i + "] " + app.bot.users[i].playerName;
			} else {
				text = text + "\n[" + i + "] ERROR: Name not found";
			}
		}
	};

	app.sendMessage(steamID, text);
});

app.addCommand("adduser", true, function (steamID, name, args) {
	if (!isNaN(args[0])) {
		app.bot.addFriend(args[0]);
		console.log(name + " added " + args[0] + ".")
	} else {
		app.sendMessage(steamID, "Please enter a valid SteamID64!");
	}
});

app.addCommand("deluser", true, function (steamID, name, args) {
	if (!isNaN(args[0])) {
		app.bot.removeFriend(args[0]);
		console.log(name + " removed " + args[0] + ".")
	} else {
		app.sendMessage(steamID, "Please enter a valid SteamID64!");
	}
});

app.addCommand("admin", false, function (steamID, name, args, strArgs) {
	if (strArgs != "" && strArgs != " ") {
		for (var i in app.bot.friends) {
			if (app.bot.friends[i] == app.Steam.EFriendRelationship.Friend) {
				app.sendMessage(i, "[Admin Chat] " + name + ": " + strArgs);
			}
		}
	}
});

app.addCommand("select", false, function (steamID, name, args) {
	var selectWork = [];

	for (var i in args) {
		if (args[i] == "*") {
			for (var k in Config.servers) {
				selectWork.push(k);
			}
			break;
		}

		var id = Number(args[i]);

		if (!isNaN(args[i]) && id >= 0 && Config.servers[id]) {
			selectWork[id] = true;
		}
	}

	if (selectWork.length > 0) {
		if (selectWork.length != Config.servers.length) {
			var text = "You have selected server ";

			for (var i in selectWork) {
				text = text + i;
				if (Number(i) + 1 != selectWork.length) {
					text = text + ", ";
				}
			}

			text = text + ".";

			app.sendMessage(steamID, text);
		} else {
			app.sendMessage(steamID, "All servers were selected.");
		}
	} else {
		app.sendMessage(steamID, "The server(s) you have selected couldn't be found.");
		return;
	}

	app.Selected[steamID] = selectWork;
});

app.addCommand("listen", false, function (steamID, name, args) {
	if (app.Listening[steamID]) {
		app.Listening[steamID] = false;
		app.sendMessage(steamID, "You have stopped listening to all servers.");
	} else {
		app.Listening[steamID] = true;
		app.sendMessage(steamID, "You are now listening to all selected servers.");
	}
});

app.addCommand("mute", false, function (steamID, name, args) {
	if (app.Muted[steamID]) {
		app.Muted[steamID] = false;
		app.sendMessage(steamID, "FoxedBot is no longer muted.");
	} else {
		app.sendMessage(steamID, "FoxedBot is now muted.");
		app.Muted[steamID] = true;
	}
});

app.addCommand("chat", false, function (steamID, name, args, strArgs) {
	if (app.Selected[steamID] && app.Selected[steamID].length > 0) {
		if (strArgs != "" && strArgs != " ") {
			var data = {
				name: name,
				message: strArgs
			}
			for (var i in app.Selected[steamID]) {
				func.sendToServer(i, "OnChat", data);
			}
		}
	} else {
		app.sendMessage(steamID, "You need to select a server first!");
	}
});

app.addCommand("announce", false, function (steamID, name, args, strArgs) {
	if (app.Selected[steamID] && app.Selected[steamID].length > 0) {
		if (strArgs != "" && strArgs != " ") {
			var data = {
				message: strArgs
			}

			for (var i in app.Selected[steamID]) {
				func.sendToServer(i, "OnAnnounce", data);
			}
		}
	} else {
		app.sendMessage(steamID, "You need to select a server first!");
	}
});

app.addCommand("players", false, function (steamID, name, args) {
	if (app.Selected[steamID] && app.Selected[steamID].length > 0) {
		var data = {
			steamID: steamID
		}

		for (var i in app.Selected[steamID]) {
			func.sendToServer(i, "GetPlayers", data);
		}
	} else {
		app.sendMessage(steamID, "You need to select a server first!");
	}
});

app.addCommand("rcon", true, function (steamID, name, args, strArgs) {
	if (app.Selected[steamID] && app.Selected[steamID].length > 0) {
		if (strArgs != "" && strArgs != " ") {
			var data = {
				steamID: steamID,
				command: strArgs
			}

			for (var i in app.Selected[steamID]) {
				func.sendToServer(i, "OnRCON", data);
			}
		}
	} else {
		app.sendMessage(steamID, "You need to select a server first!");
	}
});

app.addCommand("kick", false, function (steamID, name, args) {
	if (app.Selected[steamID] && app.Selected[steamID].length > 0) {
		var reason;
		if (!args[0]) {
			app.sendMessage(steamID, "You need to specify a name.");
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

		for (var i in app.Selected[steamID]) {
			func.sendToServer(i, "OnKick", data);
		}
	} else {
		app.sendMessage(steamID, "You need to select a server first!");
	}
});

app.addCommand("kickid", false, function (steamID, name, args) {
	if (app.Selected[steamID] && app.Selected[steamID].length > 0) {
		var reason;
		if (!args[0]) {
			app.sendMessage(steamID, "You need to specify a UserID.");
			return;
		}

		if (isNaN(args[0])) {
			app.sendMessage(steamID, "Argument #1 needs to be a number!");
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

		for (var i in app.Selected[steamID]) {
			func.sendToServer(i, "OnKickID", data);
		}
	} else {
		app.sendMessage(steamID, "You need to select a server first!");
	}
});

app.addCommand("ban", false, function (steamID, name, args) {
	if (app.Selected[steamID] && app.Selected[steamID].length > 0) {
		var time;
		var reason;
		if (!args[0]) {
			app.sendMessage(steamID, "You need to specify a name.");
			return;
		}

		if (!args[1]) {
			time = 0;
		} else {
			if (isNaN(args[1])) {
				app.sendMessage(steamID, "Argument #2 needs to be a number!");
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

		for (var i in app.Selected[steamID]) {
			func.sendToServer(i, "OnBan", data);
		}
	} else {
		app.sendMessage(steamID, "You need to select a server first!");
	}
});

app.addCommand("banid", false, function (steamID, name, args) {
	if (app.Selected[steamID] && app.Selected[steamID].length > 0) {
		var time;
		var reason;
		if (!args[0]) {
			app.sendMessage(steamID, "You need to specify a SteamID.");
			return;
		}

		if (!args[1]) {
			time = 0;
		} else {
			if (isNaN(args[1])) {
				app.sendMessage(steamID, "Argument #2 needs to be a number!");
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

		for (var i in app.Selected[steamID]) {
			func.sendToServer(i, "OnBanID", data);
		}
	} else {
		app.sendMessage(steamID, "You need to select a server first!");
	}
});

app.addCommand("unban", false, function (steamID, name, args) {
	if (app.Selected[steamID] && app.Selected[steamID].length > 0) {
		if (!args[0]) {
			app.sendMessage(steamID, "You need to specify a SteamID.");
			return;
		}

		var data = {
			steamID: steamID,
			target: args[0]
		}

		for (var i in app.Selected[steamID]) {
			func.sendToServer(i, "OnUnban", data);
		}
	} else {
		app.sendMessage(steamID, "You need to select a server first!");
	}
});

app.addCommand("tell", false, function (steamID, name, args, strArgs) {
	var slicedArgs = Array.prototype.slice.call(args, 1);
	for (var i in app.bot.friends) {
		if (app.bot.friends[i] == app.Steam.EFriendRelationship.Friend) {
			if (app.bot.users[i]) {
				if (app.bot.users[i].playerName.indexOf(args[0]) > -1) {
					app.sendMessage(i, "[Message] " + name + ": " + slicedArgs.join(' '));
					break;
				}
			}
		}
	}
});
