console.log("Loading FoxedBot...")

var fs = require("fs")

eval(fs.readFileSync(__dirname + "/bot_config.js") + "");
eval(fs.readFileSync(__dirname + "/bot_functions.js") + "");
eval(fs.readFileSync(__dirname + "/bot_main.js") + "");
eval(fs.readFileSync(__dirname + "/bot_commands.js") + "");
eval(fs.readFileSync(__dirname + "/bot_events.js") + "");