var fs = require("fs");
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
	var skip = -1;
	var args = [];
	var curString = "";

	for (var i = 0; i < text.length; i++) {
		if (i <= skip) {continue}

		var c = text.slice(i, i + 1);

		if (c === "\"" || c === "'") {
			var regex = new RegExp(c + "(.*?)" + c);
			var match = text.slice(i).match(regex);

			if (match) {
				match = match[1];
				curString = "";
				skip = i + match.length + 1;
				args.push(match);
			} else {
				curString = curString + c;
			}
		} else if (c === " " && curString !== "") {
			args.push(curString);
			curString = "";
		} else {
			if (c === " " && curString === "") {continue}
			curString = curString + c;
		}
	}

	if (curString !== "") {
		args.push(curString);
	}

	return args;
}

exports.sendToSocket = function (sock, data) {
	var buff = new Buffer(data);
	var EOT = new Buffer("\3"); // Adds an EndOfText control character at the end of every packets.

	sock.write(Buffer.concat([buff, EOT]));
}

exports.sendToServer = function(serverID, callback, data) {
	if (!app.Socks[serverID]) {
		app.logger.warn("Cannot send message to Server " + serverID + ", server not connected.");
		return false;
	}

	var sock = app.Socks[serverID];

	var jsonData = [
		callback,
		data
	];

	var jsonString = JSON.stringify(jsonData);
	exports.sendToSocket(sock, jsonString);

	return true;
}