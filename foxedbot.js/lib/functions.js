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

exports.parseArguments = function(toParse) {
	var work = [];
	var quote = false;
	var writing = false;
	var arg = 0;

	for (var i = 0; i < toParse.length; i++) {
		if (quote && !writing) {
			if (toParse[i] == quote) {
				quote = false;
				arg++;
			} else {
				work[arg] = work[arg] + toParse[i];
				continue;
			}
		} else {
			if (!writing) {
				if (toParse[i] == "\"" || toParse[i] == "'") {
					quote = toParse[i];
					work[arg] = "";
					continue;
				}
			}
		}
		if (writing) {
			if (toParse[i] == " ") {
				writing = false;
				arg++;
			} else {
				work[arg] = work[arg] + toParse[i];
				continue;
			}
		}
		if (!writing && !quote) {
			if (toParse[i] == " " && toParse[i + 1] != " " && toParse[i + 1] != "\"" && toParse[i + 1] != "'") {
				writing = true;
				work[arg] = "";
			}
		}
	}

	return work;
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