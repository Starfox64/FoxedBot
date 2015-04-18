console.log("Loading FoxedBot...");

var app = module.exports = {};

/* Modules */
try {
	var Config = require("./config/settings.js");
	var Steam = require("steam");
	var log4js = require("log4js");
	var fs = require("fs");
} catch (e) {
	console.log(e.message);
	process.exit(1);
}

var events = require("events");
var net = require("net");
var func = require("./lib/functions.js");


/* log4js */
log4js.configure({
	appenders: [
		{type: "console"},
		{type: "file", filename: func.getLogFile(), category: "LOG"}
	]
});


/* Shared Objects */
app.eventEmitter = new events.EventEmitter();
app.bot = new Steam.SteamClient();
app.logger = log4js.getLogger("LOG");
app.logger.setLevel(Config.logLevel);
app.server = net.createServer();
app.Steam = Steam;
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
var accname = Config.accountName;
var pass = Config.password;
var sentry = null;
var auth = null;
if (fs.existsSync(Config.sentryfile)) {
	app.logger.info('Reading sentry file for hash')
	sentry = fs.readFileSync(Config.sentryfile);
} else if (Config.authCode != "") {
	sentry = null;
	auth = Config.authCode;
	app.logger.info('Couldn`t find sentry hash, will use Steam Guard authenticiation code instead.');
} else {
	auth = null;
	sentry = null;
	app.logger.warn('Found no sentry hash nor authcode. Login will likely fail!');
};

/* SteamBot */
if(sentry) {
	app.bot.logOn({
		accountName: accname,
		password: pass,
		shaSentryfile: sentry
	});
} else {
	app.bot.logOn({
		accountName: accname,
		password: pass,
		authCode: auth
	});
}

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
			app.logger.fatal("FoxedBot failed to login! Reason: " + reason);
			break;
		case "loggedOff":
			app.logger.warn("FoxedBot was logged-off! Reason: " + reason);

			setTimeout(function () {
				app.logger.info("Reconnecting to Steam...");
				if(sentry) {
					app.bot.logOn({
						accountName: accname,
						password: pass,
						shaSentryfile: sentry
					});
				} else {
					app.bot.logOn({
						accountName: accname,
						password: pass,
						authCode: auth
					});
				}
			}, 5000);
			break;
		default:
			app.logger.fatal("FoxedBot encountered a fatal error and must shutdown!");
	}
});

app.bot.on("loggedOn", function() {
	app.logger.info("Logged in as " + Config.accountName + "!");
	app.bot.setPersonaState(Steam.EPersonaState.Online);
	app.bot.setPersonaName(Config.botName);
	app.server.listen(Config.botPort); // Starts listening when the bot is connected to Steam.

	/* Fetches data about offline friends (5 secs delay) */
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
	}, 5000);
});

app.bot.on("friendMsg", function (source, message) {
	if (app.bot.friends[source] == Steam.EFriendRelationship.Friend) { // Checks if the source is a friend.
		var name = app.bot.users[source].playerName;
		if (message != "") {
			if (Config.logChat) {
				app.logger.info(name + ": " + message); // Logs the message if enabled.
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
							app.logger.info(name + " [" + source + "] tried to run an Admin Only command. (" + command + ")");
						}
						return;
					}
				}
				app.sendMessage(source, "Command not found.");
				app.logger.debug(name + " [" + source + "] tried to run an unknown command. (" + message.toLowerCase().substring(1, length) + ")");
			}
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

app.bot.on('sentry', function(buffer) {
	app.logger.info("Received sentry event");
	fs.writeFile(Config.sentryfile, bugger, function(err) {
		if(err){
			app.logger.info("Failed to save sentry hash: " + err);
		} else {
			app.logger.info("Successfully saved sentry hash.");
		}
	});
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
		var data;
		try {
			if (packet.toString()[0] != "{") {
				data = JSON.parse(packet.toString().substring(4)); // Removes the 4 first characters if the first one isn't '{'
			} else {
				data = JSON.parse(packet.toString());
			}
		} catch (e) {
			app.logger.warn(sock.remoteAddress + " send an invalid JSON packet!");
		}
		if (data) {
			if (data["1"] == Config.serverKey) {
				if (data["3"] == "Event") {
					if (app.eventEmitter.listeners(data["4"]).length > 0) {
						app.eventEmitter.emit(data["4"], data["2"], data["5"])
					} else {
						app.logger.warn(sock.remoteAddress + " tried to trigger an unknown event! (" + data["4"] + ")");
					}
				} else {
					app.sendMessage(data["4"], data["5"]);
				}
			} else {
				app.logger.warn(sock.remoteAddress + " tried to connect with the wrong ServerKey!");
			}
		}
	});
});
