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
	console.log("Logged in!");
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
						// TODO: Arguments Parser :(
						commands[command].func(source, name, []);
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
	console.log("UDP Server listening on " + address.port + ".");
});

server.on("message", function (message, remote) {
	var raw = message.toString();
	var data = JSON.parse(raw);
	if (data[0] == serverKey) {
		console.log(data[1]);
	} else {
		console.log("Warning: " + remote.address + " tried to connect with the wrong ServerKey!");
	}
});

/*var msg = new Buffer(serverKey + "////" + source + "////" + name + "////chat////" + message);
var client = dgram.createSocket("udp4");
client.send(msg, 0, msg.length, 25101, "127.0.0.1", function (err, bytes) {
	if (err) throw err;
	client.close();
});*/