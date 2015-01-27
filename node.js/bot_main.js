var dgram = require("dgram");
var Steam = require("steam");

var bot = new Steam.SteamClient();
var server = dgram.createSocket("udp4");

var events = {};
var commands = {};
var selected = {};

bot.logOn({
	accountName: accountName,
	password: password
});

bot.on("loggedOn", function() {
	console.log("Logged in as " + accountName + "!");
	bot.setPersonaState(Steam.EPersonaState.Online);
	bot.setPersonaName(botName);
	server.bind(botPort, "127.0.0.1");
});

bot.on("friendMsg", function (source, message) {
	var name = bot.users[source].playerName;
	if (message != "") {
		if (showChat) {
			console.log(name + ": " + message);
		}
		if (message.substring(0, 1) == commandChar) {
			for (var command in commands) {
				if (message.toLowerCase().substring(1, command.length + 1) == command.toLowerCase()) {
					if (!commands[command].admin || isAdmin(source)) {
						commands[command].func(source, name, parseArguments(message.slice(command.length + 1)));
					} else {
						bot.sendMessage(steamID, "Access Denied!", Steam.EChatEntryType.ChatMsg);
					}
					break;
				}
			}
		}
	}
});

server.on("listening", function () {
	var address = server.address();
	console.log("UDP Server listening on port " + address.port + ".");
});

server.on("message", function (message, remote) {
	try {
		var data = JSON.parse(message.toString());
	} catch (err) {
		console.log("Warning: " + remote.address + " tried to send a non JSON message!");
	}
	if (data) {
		if (data[0] == serverKey) {
			if (data[2] == "Event") {
				if (events[data[3]]) {
					events[data[3]](data[1], data[4]);
				} else {
					console.log("Warning: " + remote.address + " tried to trigger an unknown event! (" + data[3] + ")");
				}
			} else {
				sendMessage(data[3], data[4]);
			}
		} else {
			console.log("Warning: " + remote.address + " tried to connect with the wrong ServerKey!");
		}
	}
});