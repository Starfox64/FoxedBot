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
>- Git (Windows: [Git for Windows][4])
>- SVN (Windows: [SlikSVN][5])
>- [gm_bromsock][6]

# node-steam Installation
_Sorry, no installation guide for Linux as of now, you should be able to figure it out though._
> **Windows**
>- Make sure that Node.js, Git for Windows and SlikSVN are installed
>- Open the **Git Shell** and enter this command:
```
npm install git://github.com/seishun/node-steam.git
```
>- Navigate (using the cd command) to **_CurrentUser_/node_modules/steam**
>- Enter the following command:
```
npm install
```
>- You can now close the shell, **node-steam** should be installed

# FoxedBot Installation
> **SteamBot**
>- Create a new Steam account for the SteamBot
>- Add the SteamBot to your friend-list
>- In the folder of your choice extract the contents of the _node.js_ folder
>- Open **bot_config.js** with your favorite text editor
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
node bot_start.js
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

Actually using FoxedBot
-----------------------
_**To be continued**_

[1]:https://github.com/seishun "seishun"
[2]:https://github.com/seishun/node-steam "node-steam"
[3]:http://nodejs.org/ "Node.js"
[4]:https://msysgit.github.io/ "Git for Windows"
[5]:https://sliksvn.com/download/ "SlikSVN"
[6]:http://facepunch.com/showthread.php?t=1393640 "gm_bromsock"
[7]:https://github.com/foreverjs/forever "forever"
