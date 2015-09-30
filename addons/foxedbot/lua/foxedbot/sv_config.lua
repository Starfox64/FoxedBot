-- ServerID: A unique number to identify the server with the bot.
FoxedBot.ServerID = 1

-- BotIP: The IP address of the SteamBot.
FoxedBot.BotIP = "127.0.0.1"

-- BotPort: The port of the SteamBot.
FoxedBot.BotPort = 25000

-- ServerKey: A key / password used to secure interactions between the server and the bot.
FoxedBot.ServerKey = "ChangeMe!"

-- FEATURES --
-- SendChat: Send the server's chat to the SteamBot.
FoxedBot.SendChat = true

-- AdminCaller: Enables or disables the Admin Caller functionality of FoxedBot.
FoxedBot.AdminCaller = true

-- AdminCallerCommand: The chat command used to call an admin.
FoxedBot.AdminCallerCommand = "!calladmin"

-- AdminCallerCooldown: The amount of time required before someone can send another admin call. (seconds)
FoxedBot.AdminCallerCooldown = 60

-- AdminCallerMin: The minimum amount of characters required to send an admin call.
FoxedBot.AdminCallerMin = 5

-- LogConnections: Send connects and disconnects to the SteamBot.
FoxedBot.LogConnections = true

-- LogDeaths: Send player deaths to the SteamBot.
FoxedBot.LogDeaths = true

-- BanAddon: The addon that should be used to ban players. (default/ulx/evolve/moderator)
FoxedBot.BanAddon = "default"