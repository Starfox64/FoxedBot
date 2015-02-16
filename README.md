# Introduction
**What is FoxedBot?!**  
FoxedBot is a SteamBot using [seishun][1]'s [node-steam][2] designed to control and administrate Garry's Mod servers using the Steam chat. It can also autonomously send messages to administrators when certain events occurs on a server, for example, when a player is calling for an administrator.  
  
**Features**  
>- Multiple servers
>- Multiple commands
>- Easy to customize
>- Easy to add commands
  
**Requirements**  
>- [Node.js][3] (>= 0.12.0)
>- [node-steam][2]
>- SVN (Windows: [SlikSVN][5])
>- [gm_bromsock][6]

# FoxedBot Installation
> **SteamBot**
>- Create a new Steam account for the SteamBot
>- Add the SteamBot to your friend-list
>- In the folder of your choice extract the contents of the _foxedbot.js_ folder
>- Open the command-line, navigate to the SteamBot's installation folder and enter this command:
```
npm install
```
>- Open **config/settingg.js** with your favorite text editor
>- Configure the SteamBot to suit your needs

> **Garry's Mod Server**
>- Download the latest version of [gm_bromsock][6]
>- Move the dll to **garrysmod/lua/bin**
>- Extract the **addons** folder into **garrysmod/**
>- Open **addons/foxedbot/lua/foxedbot/sv_config.lua** with your favorite text editor
>- Configure FoxedBot to suit your needs  
>- Add your server to the SteamBot's configuration file if you haven't already
  
**Note:** Make sure to update your firewall's access rules!

# Usage
Starting-up FoxedBot
--------------------
The first thing you probably want do at this point is to startup FoxedBot, to do so open a command prompt, navigate to the installation directory of FoxedBot and enter this command:
```
node app.js
```
Thats it, FoxedBot is now running, forever, or not.  
  
**Tip:**
As FoxedBot is pretty new and was coded by a French cunt (thats me) it is likely to have bugs and may crash, it is recommanded that you run FoxedBot using [forever][7], a tool that will automatically restart FoxedBot if it crashes.

Adding and removing users
-------------------------
Before you brainlessly use the **adduser** command you need to be aware of this: as your bot is an "empty" Steam account it most likely won't be able to send friend requests. To add someone the person needs to send a friend request to the bot before you use the command adduser:
```
!adduser <SteamID64>
!deluser <SteamID64>
```

FoxedBot Commands
-----------------
Command        | Description                                   | Arguments                                | Admin
:--------------|:----------------------------------------------|:-----------------------------------------|:-----
help           | Sends a list of commands                      | N/A                                      | **No**
servers        | Sends a list of servers                       | N/A                                      | **No**
ping           | Sends back **Pong!**                          | N/A                                      | **No**
who            | Sends infos about you                         | N/A                                      | **No**
friends        | Sends the SteamBot's friends                  | N/A                                      | **Yes**
adduser        | Accept / send a friend request                | ```<SteamID64>```                        | **Yes**
deluser        | Removes a friend                              | ```<SteamID64>```                        | **Yes**
admin          | Sends a message to all users                  | ```<Message>```                          | **No**
select         | Select a server with it's ID                  | ```<ServerID> [ServerID]...```           | **No**
listen         | Displays selectected server's chat & events   | N/A                                      | **No**
mute           | You won't receive any messages from FoxedBot  | N/A                                      | **No**
chat           | Sends a chat message                          | ```<Message>```                          | **No**
announce       | Displays an announcement                      | ```<Message>```                          | **No**
players        | Sends the list of players                     | N/A                                      | **No**
rcon           | Executes a console command                    | ```<Command>```                          | **Yes**
kick           | Kicks a player using his name                 | ```<Name> [Reason]```                    | **No**
kickid         | Kicks a player using his UserID               | ```<UserID> [Reason]```                  | **No**
ban            | Bans a player using his name                  | ```<Name> [Minutes] [Reason]```          | **No**
banid          | Bans a player using his SteamID (No SteamID64)| ```<SteamID> [Minutes] [Reason]```       | **No**
unban          | Unbans a player using his SteamID             | ```<SteamID>```                          | **No**

# Developers
_This section is for developers who which to add commands, callbacks and events._  
  
Commands, callbacks and event, what are they? Commands are functions that will be called when a command is ran, callbacks are functions that will be ran on the server when the SteamBot tells him to and events are functions that will be ran on the SteamBot when a server tells him to.
Commands
--------
Commands can easily be added to FoxedBot in the **config/commands.js** file.  
**Format**
```js
app.addCommand("CommandName", AdminOnly, function (steamID, name, args, strArgs) {});
```
**Arguments**

Type     | Description
---------|----------------------------------------------------------
string   | The name of the command
bool     | Weither or not the command is admin only
function | The function that will be called when the command is ran

**Function Arguments**

Variable   | Type     | Description
-----------|----------|------------------------------------------------
steamID    | string   | The SteamID64 of the user who ran the command
name       | string   | The name of the user who ran the command
args       | array    | The arguments of the command parsed as an array
strArgs    | string   | The arguments of the function in a raw string

**Example**
```js
app.addCommand("chat", false, function (steamID, name, args, strArgs) {
	if (app.Selected[steamID] && app.Selected[steamID].length > 0) { // Checks if the user selected a server.
		if (strArgs != "" && strArgs != " ") { // Checks if the ran arguments isn't empty
			var data = { // Creates the array that will be sent
				name: name,
				message: strArgs
			}
			for (var i in selected[steamID]) { // Calls the OnChat callback on all selected servers
				func.sendToServer(i, "OnChat", data);
			}
		}
	} else {
		app.sendMessage(steamID, "You need to select a server first!"); // Tells the user to select a server
	}
});
```

Callbacks
---------
Callbacks can easily be added to FoxedBot in the **sv_callbacks.lua** file.  
**Format**
```lua
FoxedBot.addCallback("CallbackName", function( data ) end)
```
_data_ is a table containing data that may be required for the callback, for example a message to display.  
**Example**
```lua
FoxedBot.addCallback("OnRCON", function( data )
	game.ConsoleCommand(data.command.."\n") -- Executes data.command
	FoxedBot.sendMessage(data.steamID, data.command.." has been executed on server "..FoxedBot.ServerID..".") -- Sends a confirmation to the user
end)
```

Events
------
Events can easily be added to FoxedBot in the **sv_events.lua** and **config/events.js** files.  
**Sending event**
```lua
local data = {
	text = "Hello World!"
}

FoxedBot.sendEvent("EventName", data)
```

**Receiving an event**
```js
app.on("EventName", function (serverID, data) {});
```

**Example**
```lua
hook.Add("PlayerSay", "FoxedBot_PlayerSay", function( ply, text ) -- Called when a player says something
	if FoxedBot.SendChat then -- Checks is SendChat is enabled
		local data = { -- Creates the table to send
			name = ply:Name(),
			text = text
		}

		FoxedBot.sendEvent("OnChat", data) -- Sends the event to the SteamBot
	end
end)
```
```js
app.on("OnChat", function (serverID, data) {
	for (var i in app.Listening) { // For all users in the listening array
		if (app.Listening[i]) { // Checks if the user is listening
			if (app.Selected[i] && app.Selected[i][serverID]) { // Checks if the user is listening to the current serverID
				app.sendMessage(i, "[" + serverID + "] " + data.name + ": " + data.text); // Sends the chat to the user
			}
		}
	}
});
```

# Notes
Support
-------
If you are having issues with FoxedBot please use the [issues tracker][8] and check if a similar issue was posted before posting yours. Remember to provide as much information as possible.

Pull Requests
-------------
Feel free to submit your pull requests if you beleive FoxedBot lacks a feature or if you find a bug that you are able to fix.  
**Note:** However, please try to follow my coding style.

Credits
-------
**seishun** - node-steam  
**_FR_Starfox64** - FoxedBot  
**Metamist** - Node.js Consultant ;)

[1]:https://github.com/seishun "seishun"
[2]:https://github.com/seishun/node-steam "node-steam"
[3]:http://nodejs.org/ "Node.js"
[4]:https://msysgit.github.io/ "Git for Windows"
[5]:https://sliksvn.com/download/ "SlikSVN"
[6]:http://facepunch.com/showthread.php?t=1393640 "gm_bromsock"
[7]:https://github.com/foreverjs/forever "forever"
[8]:https://github.com/Starfox64/FoxedBot/issues "issues"
