console.log("Loading FoxedBot...");

var events = require("events");
var net = require("net");

try {
	var Config = require("./config/settings.js");
	var Steam = require("steam");
} catch (e) {
	console.log(e.message);
	process.exit(1);
}

var func = require("./lib/functions.js");

var app = module.exports = {};

/* SHARED */
app.eventEmitter = new events.EventEmitter();
app.bot = new Steam.SteamClient();
app.Steam = Steam;
app.Commands = {};
app.Selected = {};
app.Listening = {};
app.Muted = {};

var bot = app.bot; // Shortcut
var server = net.createServer();
server.on("error", function (e) {}); // Ignores TCP errors


app.addCommand = function (commandName, admin, func) {
	var data = {
		admin: admin,
		func: func
	};
	this.Commands[commandName] = data;
}

app.sendMessage = function (steamID, message) {
	if (this.Muted[steamID] != true && bot.users[steamID]) {
		if (Config.sendOffline || bot.users[steamID].personaState != Steam.EPersonaState.Offline) {
			bot.sendMessage(steamID, message, Steam.EChatEntryType.ChatMsg);
		}
	}
}

require("./config/events.js");
require("./config/commands.js");


bot.logOn({
	accountName: Config.accountName,
	password: Config.password,
	authCode: Config.authCode
});

bot.on("error", function (e) {
	switch (e.cause) {
		case "logonFail":
			var reason = "Unknown";
			for (var i in Steam.EResult) {
				if (Steam.EResult[i] == e.eresult) {
					reason = i;
					break;
				}
			}
			console.log("FoxedBot failed to login! Reason: " + reason);
			break;
		case "loggedOff":
			var reason = "Unknown";
			for (var i in Steam.EResult) {
				if (Steam.EResult[i] == e.eresult) {
					reason = i;
					break;
				}
			}
			console.log("FoxedBot was logged-off! Reason: " + reason);
			break;
		default:
			console.log("FoxedBot encountered a fatal error and must shutdown!");
	}
});

bot.on("loggedOn", function() {
	console.log("Logged in as " + Config.accountName + "!");
	bot.setPersonaState(Steam.EPersonaState.Online);
	bot.setPersonaName(Config.botName);
	server.listen(Config.botPort); // Starts listening when the bot is connected to Steam.

	/* Fetches data about offline friends (5 secs delay) */
	setTimeout(function() {
		var toFetch = [];

		for (var i in app.bot.friends) {
			if (bot.friends[i] == Steam.EFriendRelationship.Friend) {
				if (!bot.users[i]) {
					toFetch.push(i);
				}
			}
		}

		if (toFetch.length > 0) {
			bot.requestFriendData(toFetch);
		}
	}, 5000);
});

/* Handles incoming messages */
bot.on("friendMsg", function (source, message) {
	if (bot.friends[source] == Steam.EFriendRelationship.Friend) { // Checks if the source is a friend.
		var name = bot.users[source].playerName;
		if (message != "") {
			if (Config.showChat) {
				console.log(name + ": " + message); // Echoes the message to the console if enabled.
			}
			if (message.substring(0, 1) == Config.commandChar) { // checks if the first character is the command character (!).
				var length = 0;
				for (var i in message) { // This loop gets the length of the entered command.
					if (message[i] == " ") {
						length = i;
						break;
					}
				}

				if (length == 0) {
					length = message.length;
				}

				for (var command in app.Commands) { // Looks for the command in the commands array.
					if (message.toLowerCase().substring(1, length) == command.toLowerCase()) {
						if (!app.Commands[command].admin || func.isAdmin(source)) { // Checks if the command requires admin rights.
							app.Commands[command].func(source, name, func.parseArguments(message.slice(command.length + 1)), message.slice(command.length + 1)); // Parses the command's arguments and runs the commands function.
						} else {
							app.sendMessage(source, "Access Denied!");
						}
						return;
					}
				}
				app.sendMessage(source, "Command not found.");
			}
		}
	}
});

/* Makes sure peoples that aren't friends can't listen */
bot.on("friend", function (steamID, status) {
	if (status != Steam.EFriendRelationship.Friend) {
		if (app.Listening[steamID]) {
			app.Listening[steamID] = null;
		}
	}
});

server.on("listening", function () {
	var address = server.address();
	console.log("FoxedBot is now listening on port " + address.port + ".");
});

/* Handles incoming data */
server.on("connection", function (sock) {
	sock.on("data", function (packet) {
		var data;
		try {
			if (packet.toString()[0] != "{") {
				data = JSON.parse(packet.toString().substring(4)); // Removes the 4 first characters if the first one isn't '{'
			} else {
				data = JSON.parse(packet.toString());
			}
		} catch (e) {}
		if (data) {
			if (data["1"] == Config.serverKey) {
				if (data["3"] == "Event") {
					if (app.eventEmitter.listeners(data["4"]).length > 0) {
						app.eventEmitter.emit(data["4"], data["2"], data["5"])
					} else {
						console.log("Warning: " + sock.remoteAddress + " tried to trigger an unknown event! (" + data["4"] + ")");
					}
				} else {
					app.sendMessage(data["4"], data["5"]);
				}
			} else {
				console.log("Warning: " + sock.remoteAddress + " tried to connect with the wrong ServerKey!");
			}
		}
	});
});