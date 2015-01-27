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
	var buff = new Buffer(JSON.stringify(data));
	var client = dgram.createSocket("udp4");

	client.send(buff, 0, buff.length, servers[serverID].port, servers[serverID].ip, function (err, bytes) {
		if (err) throw err;
		client.close();
	});
}

function sendMessage (steamID, message) {
	bot.sendMessage(steamID, message, Steam.EChatEntryType.ChatMsg);
}