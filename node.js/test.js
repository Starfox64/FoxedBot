var text = '!motd hello! "red!" "Hello there!"';
var cmd = "motd";
var txt = text.slice(cmd.length + 1);
var args = [];
var quote = false;
var writing = false;
var arg = 0;

//var text = '!motd red Hello there!'

for (var i = 0; i < txt.length; i++) {
	if (quote && !writing) {
		if (txt[i] == quote) {
			quote = false;
			arg++;
			continue;
		} else {
			args[arg] = args[arg] + txt[i];
			continue;
		}
	} else {
		if (txt[i] == "\"" || txt[i] == "'") {
			quote = txt[i];
			args[arg] = "";
			continue;
		}
	}
	if (writing) {
		if (txt[i] == " ") {
			writing = false;
			arg++;
			continue;
		} else {
			args[arg] = args[arg] + txt[i];
			continue;
		}
	}
	if (!writing && !quote) {
		if (txt[i] == " " && txt[i + 1] != " " && txt[i + 1] != "\"" && txt[i + 1] != "'") {
			writing = true;
			args[arg] = "";
			continue;
		}
	}
}

for (var i in args) {
	console.log(args[i]);
}