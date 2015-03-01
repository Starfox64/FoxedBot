var Config = require("./settings.js");
var func = require("../lib/functions.js");
var app = require("../app.js");

app.addCommand("help", false, function (steamID, name, args) {
	var text = "Available commands:";

	for (var i in app.Commands) {
		text = text + "\n    - " + i;
	};

	app.sendMessage(steamID, text);
	app.logger.info(name + " [" + steamID + "] is requesting the commands list.");
});

app.addCommand("servers", false, function (steamID, name, args) {
	var text = "Servers:";

	for (var i in Config.servers) {
		text = text + "\n    " + i + ". " + Config.servers[i].name;
	};

	app.sendMessage(steamID, text);
	app.logger.info(name + " [" + steamID + "] is requesting the servers list.");
});

app.addCommand("ping", false, function (steamID, name, args) {
	app.sendMessage(steamID, "Pong!");
	app.logger.info(name + " [" + steamID + "] is pinging FoxedBot.");
});

app.addCommand("who", false, function (steamID, name, args) {
	var admin = "No";

	if (func.isAdmin(steamID)) {
		admin = "Yes";
	}

	var text = "\nName: " + name + "\nSteamID64: " + steamID + "\nAdmin: " + admin;

	app.sendMessage(steamID, text);
	app.logger.info(name + " [" + steamID + "] is requesting data about himself.");
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
	app.logger.info(name + " [" + steamID + "] is requesting the friends list.");
});

app.addCommand("adduser", true, function (steamID, name, args) {
	if (!isNaN(args[0])) {
		app.bot.addFriend(args[0]);
		app.logger.info(name + " [" + steamID + "] added " + args[0] + ".");
	} else {
		app.sendMessage(steamID, "Please enter a valid SteamID64!");
	}
});

app.addCommand("deluser", true, function (steamID, name, args) {
	if (!isNaN(args[0])) {
		app.bot.removeFriend(args[0]);
		app.logger.info(name + " [" + steamID + "] removed " + args[0] + ".");
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
		app.logger.info(name + " [" + steamID + "] -> Admin Chat : " + strArgs);
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
			app.logger.info(name + " [" + steamID + "] selected server(s) " + text.slice(25));
		} else {
			app.sendMessage(steamID, "All servers were selected.");
			app.logger.info(name + " [" + steamID + "] selected all servers.");
		}
	} else {
		app.sendMessage(steamID, "The server(s) you have selected couldn't be found.");
		app.logger.debug(name + " [" + steamID + "] failed to properly select a server.");
		return;
	}

	app.Selected[steamID] = selectWork;
});

app.addCommand("listen", false, function (steamID, name, args) {
	if (app.Listening[steamID]) {
		app.Listening[steamID] = false;
		app.sendMessage(steamID, "You have stopped listening to all servers.");
		app.logger.info(name + " [" + steamID + "] is no longer listening.");
	} else {
		app.Listening[steamID] = true;
		app.sendMessage(steamID, "You are now listening to all selected servers.");
		app.logger.info(name + " [" + steamID + "] started listening.");
	}
});

app.addCommand("mute", false, function (steamID, name, args) {
	if (app.Muted[steamID]) {
		app.Muted[steamID] = false;
		app.sendMessage(steamID, "FoxedBot is no longer muted.");
		app.logger.info(name + " [" + steamID + "] unmuted FoxedBot.");
	} else {
		app.sendMessage(steamID, "FoxedBot is now muted.");
		app.logger.info(name + " [" + steamID + "] muted FoxedBot.");
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
			app.logger.info(name + " [" + steamID + "] -> Server Chat : " + strArgs);
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
			app.logger.info(name + " [" + steamID + "] -> Server Announcement : " + strArgs);
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
		app.logger.info(name + " [" + steamID + "] is requesting the list of players.");
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
		app.logger.info(name + " [" + steamID + "] -> RCON : " + strArgs);
	} else {
		app.sendMessage(steamID, "You need to select a server first!");
	}
});

app.addCommand("kick", false, function (steamID, name, args) {
	if (app.Selected[steamID] && app.Selected[steamID].length > 0) {
		var reason;
		if (!args[0]) {
			app.sendMessage(steamID, "You need to specify a name.");
			app.logger.debug(name + " [" + steamID + "] is trying to kick without a name.");
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
		app.logger.info(name + " [" + steamID + "] is trying to kick " + args[0] + " for " + reason);
	} else {
		app.sendMessage(steamID, "You need to select a server first!");
	}
});

app.addCommand("kickid", false, function (steamID, name, args) {
	if (app.Selected[steamID] && app.Selected[steamID].length > 0) {
		var reason;
		if (!args[0]) {
			app.sendMessage(steamID, "You need to specify a UserID.");
			app.logger.debug(name + " [" + steamID + "] is trying to kickid without a UserID.");
			return;
		}

		if (isNaN(args[0])) {
			app.sendMessage(steamID, "Argument #1 needs to be a number!");
			app.logger.debug(name + " [" + steamID + "] is trying to kickid with an invalid UserID.");
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
	app.logger.info(name + " [" + steamID + "] is trying to kickid " + args[0] + " for " + reason);
});

app.addCommand("ban", false, function (steamID, name, args) {
	if (app.Selected[steamID] && app.Selected[steamID].length > 0) {
		var time;
		var reason;
		if (!args[0]) {
			app.sendMessage(steamID, "You need to specify a name.");
			app.logger.debug(name + " [" + steamID + "] is trying to ban without a name.");
			return;
		}

		if (!args[1]) {
			time = 0;
		} else {
			if (isNaN(args[1])) {
				app.sendMessage(steamID, "Argument #2 needs to be a number!");
				app.logger.debug(name + " [" + steamID + "] is trying to ban with an invalid time.");
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
		app.logger.info(name + " [" + steamID + "] is trying to ban " + args[0] + " for " + time + " minutes for " + reason);
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
			app.logger.debug(name + " [" + steamID + "] is trying to banid without a SteamID.");
			return;
		}

		if (!args[1]) {
			time = 0;
		} else {
			if (isNaN(args[1])) {
				app.sendMessage(steamID, "Argument #2 needs to be a number!");
				app.logger.debug(name + " [" + steamID + "] is trying to banid with an invalid time.");
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
		app.logger.info(name + " [" + steamID + "] is trying to banid " + args[0] + " for " + time + " minutes for " + reason);
	} else {
		app.sendMessage(steamID, "You need to select a server first!");
	}
});

app.addCommand("unban", false, function (steamID, name, args) {
	if (app.Selected[steamID] && app.Selected[steamID].length > 0) {
		if (!args[0]) {
			app.sendMessage(steamID, "You need to specify a SteamID.");
			app.logger.debug(name + " [" + steamID + "] is trying to unban without a SteamID.");
			return;
		}

		var data = {
			steamID: steamID,
			target: args[0]
		}

		for (var i in app.Selected[steamID]) {
			func.sendToServer(i, "OnUnban", data);
		}
		app.logger.info(name + " [" + steamID + "] is trying to unban " + args[0]);
	} else {
		app.sendMessage(steamID, "You need to select a server first!");
	}
});

app.addCommand("tell", false, function (steamID, name, args, strArgs) {
	if (!args[0]) {
		app.sendMessage(steamID, "You need to specify a Name.");
		app.logger.debug(name + " [" + steamID + "] is trying to send a message without a name.");
		return;
	}

	if (!args[1]) {
		app.sendMessage(steamID, "You need to specify a Message.");
		app.logger.debug(name + " [" + steamID + "] is trying to send a message without a message.");
		return;
	}

	var slicedArgs = Array.prototype.slice.call(args, 1);
	for (var i in app.bot.friends) {
		if (app.bot.friends[i] == app.Steam.EFriendRelationship.Friend) {
			if (app.bot.users[i]) {
				if (app.bot.users[i].playerName.toLowerCase().indexOf(args[0].toLowerCase()) > -1) {
					app.sendMessage(i, "[Message] " + name + ": " + slicedArgs.join(' '));
					app.logger.info(name + " [" + steamID + "] -> " + app.bot.users[i].playerName + " [" + i + "]: " + slicedArgs.join(' '));
					return;
				}
			}
		}
	}

	app.sendMessage(steamID, "User not found.");
	app.logger.debug(name + " [" + steamID + "] is trying to send a message to an invalid user.");
});