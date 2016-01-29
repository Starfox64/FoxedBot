console.log("Loading FoxedBot...");

var app = module.exports = {};

/* Modules */
try {
	var Config = require("./config/settings.js");
	var Steam = require("steam");
	var log4js = require("log4js");
} catch (e) {
	console.log(e.message);
	process.exit(1);
}

var events = require("events");
var net = require("net");
var fs = require("fs");
var readline = require("readline");
var func = require("./lib/functions.js");


/* log4js */
log4js.configure({
	appenders: [
		{type: "console"},
		{type: "file", filename: func.getLogFile(), category: "LOG"}
	]
});

/* readline */
var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});


/* Shared Objects */
app.eventEmitter = new events.EventEmitter();
app.bot = new Steam.SteamClient();
app.logger = log4js.getLogger("LOG");
app.logger.setLevel(Config.logLevel);
app.server = net.createServer();
app.Steam = Steam;
app.Socks = {};
app.Commands = {};
app.Selected = {};
app.Listening = {};
app.Muted = {};

app.addCommand = function (commandName, admin, func) {
	var data = {
		admin: admin,
		func: func
	};
	this.Commands[commandName] = data;
}

app.sendMessage = function (steamID, message) {
	if (this.Muted[steamID] != true && app.bot.users[steamID]) {
		if (Config.sendOffline || app.bot.users[steamID].personaState != Steam.EPersonaState.Offline) {
			app.bot.sendMessage(steamID, message, Steam.EChatEntryType.ChatMsg);
			app.logger.debug("FoxedBot -> " + steamID + ": " + message);
		}
	}
}


/* Loads Commands & Events */
require("./config/events.js");
require("./config/commands.js");

/* Load variables from config */
var sentryHash;

if (fs.existsSync(Config.sentryfile)) {
	app.logger.info("Sentry hash found, reading...")
	sentryHash = fs.readFileSync(Config.sentryfile);
}

/* SteamBot */
function botLogOn (sentry, code) {
	if (sentry) {
		app.bot.logOn({
			accountName: Config.accountName,
			password: Config.password,
			shaSentryfile: sentry
		});
	} else if (code) {
		app.bot.logOn({
			accountName: Config.accountName,
			password: Config.password,
			authCode: code
		});
	} else {
		app.bot.logOn({
			accountName: Config.accountName,
			password: Config.password
		});
	}
}

botLogOn(sentryHash);

app.bot.on("error", function (e) {
	var reason = "Unknown";
	for (var i in Steam.EResult) {
		if (Steam.EResult[i] == e.eresult) {
			reason = i;
			break;
		}
	}

	switch (e.cause) {
		case "logonFail":
			app.logger.warn("FoxedBot failed to login! Reason: " + reason);

			if (e.eresult == Steam.EResult.AccountLogonDenied) {
				rl.question("Steam Guard code required: ", function(code) {
					botLogOn(null, code);
				});
			}
			break;
		case "loggedOff":
			app.logger.warn("FoxedBot was logged-off! Reason: " + reason);

			setTimeout(function () {
				app.logger.info("Reconnecting to Steam...");
				botLogOn(sentryHash);
			}, 5000);
			break;
		default:
			app.logger.fatal("FoxedBot encountered a fatal error and must shutdown!");
	}
});

app.bot.on('sentry', function(buffer) {
	fs.writeFile(Config.sentryfile, buffer, function(err) {
		if (err) {
			app.logger.error("Failed to save the sentry hash: " + err.message);
		} else {
			app.logger.info("Successfully saved the sentry hash.");
		}
	});
});

app.bot.on("loggedOn", function() {
	app.logger.info("Logged in as " + Config.accountName + "!");
	app.bot.setPersonaState(Steam.EPersonaState.Online);
	app.bot.setPersonaName(Config.botName);
	app.server.listen(Config.botPort); // Starts listening when the bot is connected to Steam.

	/* Fetches data about offline friends (1 secs delay) */
	setTimeout(function() {
		var toFetch = [];

		for (var i in app.bot.friends) {
			if (app.bot.friends[i] == Steam.EFriendRelationship.Friend) {
				if (!app.bot.users[i]) {
					toFetch.push(i);
				}
			}
		}

		if (toFetch.length > 0) {
			app.logger.debug("Running requestFriendData()...");
			app.bot.requestFriendData(toFetch);
		}
	}, 1000);
});

app.bot.on("friendMsg", function (source, message) {
	if (app.bot.friends[source] == Steam.EFriendRelationship.Friend) { // Checks if the source is a friend.
		if (!app.bot.users[source]) { // Cancels the command and runs requestFriendData on source if source is unknown.
			app.sendMessage(source, "Error, please try again later.");
			app.logger.info("Unknown Friend [" + source + "], requesting friend data...");
			app.bot.requestFriendData([source]);
			return;
		}

		var name = app.bot.users[source].playerName;

		if (message != "") {
			if (Config.logChat) {
				app.logger.info(name + ": " + message); // Logs the message if enabled.
			}

			for (var command in app.Commands) { // Looks for the command in the commands array.
				if (message.toLowerCase().startsWith(command.toLowerCase())) {
					if (!app.Commands[command].admin || func.isAdmin(source)) { // Checks if the command requires admin rights.
						var arguments = message.slice(command.length).trim();
						app.Commands[command].func(source, name, func.parseArguments(arguments), arguments); // Parses the command's arguments and runs the commands function.
					} else {
						app.sendMessage(source, "Access Denied!");
						app.logger.info(name + " [" + source + "] tried to run an Admin Only command. (" + command + ")");
					}
					return;
				}
			}

			app.sendMessage(source, "Command not found.");
			app.logger.debug(name + " [" + source + "] tried to run an unknown command.");
		}

		return;
	}

	app.logger.debug(source + " isn't a friend and is sending messages to FoxedBot.");
});

app.bot.on("friend", function (steamID, status) {
	if (status != Steam.EFriendRelationship.Friend) { // Removes non-friends from the listening list.
		if (app.Listening[steamID]) {
			app.Listening[steamID] = null;
			app.logger.debug("Removing " + steamID + " from the listening list.");
		}
	}
});

/* TCP Server */
app.server.on("error", function (e) {
	app.logger.error("TCP Server Error: " + e.message);
});

app.server.on("listening", function () {
	var address = app.server.address();
	app.logger.info("FoxedBot is now listening on port " + address.port + ".");
});

app.server.on("connection", function (sock) {
	sock.on("data", function (packet) {
		try {
			var data = JSON.parse(packet.toString());
		} catch (e) {
			app.logger.warn(sock.remoteAddress + " sent an invalid JSON packet!");
			return;
		}

		if (isNaN(sock.serverID)) { // Checks if the socket is authenticated
			if (data[0] === "AUTH") {
				if (data[1] === Config.serverKey) {
					if (Config.servers[data[2]]) { // Checks if the provided serverID exists
						sock.serverID = data[2];
						app.Socks[sock.serverID] = sock;
						app.logger.info("Server " + sock.serverID + " has been authenticated!");
						func.sendToSocket(sock, JSON.stringify(["SYS", "AUTHED"]));

						return;
					} else {
						app.logger.warn(sock.remoteAddress + " provided an invalid ServerID!");
					}
				} else {
					app.logger.warn(sock.remoteAddress + " provided the wrong ServerKey!");
				}
			} else {
				app.logger.warn(sock.remoteAddress + " is sending data and is not authenticated!");
			}

			func.sendToSocket(sock, JSON.stringify(["SYS", "DENIED"]));
		} else {
			if (data[0] === "Event") {
				if (app.eventEmitter.listeners(data[1]).length > 0) {
					app.eventEmitter.emit(data[1], sock.serverID, data[2])
				} else {
					app.logger.warn(sock.remoteAddress + " tried to trigger an unknown event! (" + data[1] + ")");
				}
			} else {
				app.sendMessage(data[2], data[3]);
			}
		}
	});

	sock.on("end", function () {
		if (sock.serverID) {
			app.logger.info("Server " + sock.serverID + " disconnected.");
			delete app.Socks[sock.serverID];
		} else {
			app.logger.info("Socket " + sock.remoteAddress + " disconnected.");
		}

		sock.destroy();
	});

	sock.on("error", function (err) {
		if (sock.serverID) {
			app.logger.error("Server " + sock.serverID + " error: " + err.code);
			delete app.Socks[sock.serverID];
		} else {
			app.logger.error("Socket " + sock.remoteAddress + " error: " + err.code);
		}

		sock.destroy();
	});

	sock.setKeepAlive(true, 0);
});
