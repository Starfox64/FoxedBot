var net = require("net");
var Steam = require("steam");

var bot = new Steam.SteamClient();
var server = net.createServer();;

var events = {};
var commands = {};
var selected = {};
var listening = {};
var muted = {};

bot.logOn({
	accountName: accountName,
	password: password
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
	console.log("Logged in as " + accountName + "!");
	bot.setPersonaState(Steam.EPersonaState.Online);
	bot.setPersonaName(botName);
	server.listen(botPort); // Starts listening when the bot is connected to Steam.
});

/* Handles incoming messages */
bot.on("friendMsg", function (source, message) {
	if (bot.friends[source] == Steam.EFriendRelationship.Friend) { // Checks if the source is a friend.
		var name = bot.users[source].playerName;
		if (message != "") {
			if (showChat) {
				console.log(name + ": " + message); // Echoes the message to the console if enabled.
			}
			if (message.substring(0, 1) == commandChar) { // checks if the first character is the command character (!).
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

				for (var command in commands) { // Looks for the command in the commands array.
					if (message.toLowerCase().substring(1, length) == command.toLowerCase()) {
						if (!commands[command].admin || isAdmin(source)) { // Checks if the command requires admin rights.
							commands[command].func(source, name, parseArguments(message.slice(command.length + 1)), message.slice(command.length + 1)); // Parses the command's arguments and runs the commands function.
						} else {
							sendMessage(source, "Access Denied!");
						}
						return;
					}
				}
				sendMessage(source, "Command not found.");
			}
		}
	}
});

/* Makes sure peoples that aren't friends can't listen */
bot.on("friend", function (steamID, status) {
	if (status != Steam.EFriendRelationship.Friend) {
		if (listening[steamID]) {
			listening[steamID] = null;
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
			if (data["1"] == serverKey) {
				if (data["3"] == "Event") {
					if (events[data["4"]]) {
						events[data["4"]](data["2"], data["5"]);
					} else {
						console.log("Warning: " + sock.remoteAddress + " tried to trigger an unknown event! (" + data["4"] + ")");
					}
				} else {
					sendMessage(data["4"], data["5"]);
				}
			} else {
				console.log("Warning: " + sock.remoteAddress + " tried to connect with the wrong ServerKey!");
			}
		}
	});
});