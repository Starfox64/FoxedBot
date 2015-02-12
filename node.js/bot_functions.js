/* Use this functions to add an event */
function addEvent (name, func) {
	events[name] = func;
}

/* Use this function to add a command */
function addCommand (name, admin, func) {
	var work = {
		admin: admin,
		func: func
	};
	commands[name] = work;
}

function isAdmin (steamID) {
	var isAdmin = false;

	for (var i in admins) {
		if (admins[i] == steamID) {
			isAdmin = true;
			break;
		}
	}

	return isAdmin;
}

function parseArguments (toParse) {
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
			if (toParse[i] == "\"" || toParse[i] == "'") {
				quote = toParse[i];
				work[arg] = "";
				continue;
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

function sendToServer (serverID, callback, data) {
	var jsonData = [
		serverKey,
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

	client.connect(servers[serverID].port, servers[serverID].ip, function () {
		client.write(prefix + toSend);
	});
}

function sendMessage (steamID, message) {
	if (muted[steamID] != true && bot.users[steamID]) {
		if (sendOffline || bot.users[steamID].personaState != Steam.EPersonaState.Offline) {
			bot.sendMessage(steamID, message, Steam.EChatEntryType.ChatMsg);
		}
	}
}