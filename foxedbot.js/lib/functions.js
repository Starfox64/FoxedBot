var fs = require("fs");
var net = require("net");
var Config = require("../config/settings.js");
var app = require("../app.js");

var exports = module.exports = {};


exports.getLogFile = function () {
	var date = new Date();
	var logFile = "./logs/" + date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + "_" + date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds() + ".log";

	if (!fs.existsSync("./logs")) {
		fs.mkdirSync("./logs");
	}

	return logFile;
}

exports.isAdmin = function(steamID) {
	var isAdmin = false;

	for (var i in Config.admins) {
		if (Config.admins[i] == steamID) {
			isAdmin = true;
			break;
		}
	}

	return isAdmin;
}

// Originally made in Lua by Chessnut for Nutscript, available under the MIT license.
exports.parseArguments = function(text) {
	var skip = -1
	var args = []
	var curString = ""

	for (var i = 0; i < text.length; i++) {
		if (i <= skip) {continue}

		var c = text.slice(i, i + 1)

		if (c === "\"" || c === "'") {
			var regex = new RegExp(c + "(.*?)" + c)
			var match = text.slice(i).match(regex)

			if (match) {
				match = match[1]
				curString = ""
				skip = i + match.length + 1
				args.push(match)
			} else {
				curString = curString + c
			}
		} else if (c === " " && curString !== "") {
			args.push(curString)
			curString = ""
		} else {
			if (c === " " && curString === "") {continue}
			curString = curString + c
		}
	}

	if (curString !== "") {
		args.push(curString)
	}

	return args
}

exports.sendToServer = function(serverID, callback, data) {
	var jsonData = [
		Config.serverKey,
		callback,
		data
	];

	var jsonString = JSON.stringify(jsonData);

	var client = new net.Socket();

	var buffer1 = new Buffer(4);
	var buffer2 = new Buffer(jsonString);

	buffer1.writeUInt32LE(Buffer.byteLength(jsonString), 0);
	var toSend = Buffer.concat([buffer1, buffer2]);


	client.setTimeout(3000, function () {
		client.end();
		client.destroy();
	});

	client.on("error", function (err) {
		app.logger.error("An error occured while trying to send data to server " + serverID + ".");
	});

	client.connect(Config.servers[serverID].port, Config.servers[serverID].ip, function () {
		client.write(toSend);
	});
}