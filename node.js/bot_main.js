var dgram = require("dgram");
var Steam = require("steam");

var bot = new Steam.SteamClient();
var server = dgram.createSocket("udp4");

var events = {};
var commands = {};
var selected = {};
var listening = {};

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
	server.bind(botPort, "127.0.0.1"); // Start listening when the bot is connected to Steam.
});

bot.on("friendMsg", function (source, message) {
	if (bot.friends[source] == Steam.EFriendRelationship.Friend) { // Checks if the source is a friend.
		var name = bot.users[source].playerName;
		if (message != "") {
			if (showChat) {
				console.log(name + ": " + message); // Echoes the message to the console if enabled.
			}
			if (message.substring(0, 1) == commandChar) { // checks if the first character is the command character (!).
				for (var command in commands) { // Looks for the command in the commands array.
					if (message.toLowerCase().substring(1, command.length + 1) == command.toLowerCase()) {
						if (!commands[command].admin || isAdmin(source)) { // Checks if the command requires admin rights.
							commands[command].func(source, name, parseArguments(message.slice(command.length + 1))); // Parses the command's arguments and runs the commands function.
						} else {
							sendMessage(source, "Access Denied!");
						}
						break;
					}
				}
			}
		}
	}
});

server.on("listening", function () {
	var address = server.address();
	console.log("UDP Server listening on port " + address.port + ".");
});

/* Parses incoming UDP packets */
server.on("message", function (message, remote) {
	try {
		var data = JSON.parse(message.toString());
	} catch (err) {
		console.log("Warning: " + remote.address + " tried to send a non JSON message!");
	}
	if (data) {
		if (data["1"] == serverKey) {
			if (data["3"] == "Event") {
				if (events[data["4"]]) {
					events[data["4"]](data["2"], data["5"]);
				} else {
					console.log("Warning: " + remote.address + " tried to trigger an unknown event! (" + data["4"] + ")");
				}
			} else {
				sendMessage(data["4"], data["5"]);
			}
		} else {
			console.log("Warning: " + remote.address + " tried to connect with the wrong ServerKey!");
		}
	}
});