var net = require("net");
var Config = require("../config/settings.js");
var exports = module.exports = {};


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

	var toSend = JSON.stringify(jsonData);
	var client = new net.Socket();
	var size = Buffer.byteLength(toSend);
	var b1 = size & 0xff;
	var b2 = (size>>>8) & 0xff;
	var b3 = (size>>>16) & 0xff;
	var b4 = (size>>>24) & 0xff;
	var prefix = String.fromCharCode(b4, b3, b2, b1);

	client.setTimeout(3000, function () {
		client.end();
		client.destroy();
	});

	client.on("error", function (err) {
		console.log("An error occured while trying to send data to server " + serverID + ".");
	});

	client.connect(Config.servers[serverID].port, Config.servers[serverID].ip, function () {
		client.write(prefix + toSend);
	});
}