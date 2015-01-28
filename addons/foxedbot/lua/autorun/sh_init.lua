-- Initialization file for FoxedBot

FoxedBot = {}

MsgC(Color(251, 184, 41), "[FoxedBot] Initializing...\n")

if SERVER then
	AddCSLuaFile("foxedbot/cl_foxedbot.lua")
	
	include("foxedbot/sv_config.lua")
	include("foxedbot/sv_foxedbot.lua")
	include("foxedbot/sv_callbacks.lua")
	include("foxedbot/sv_events.lua")
else
	include("foxedbot/cl_foxedbot.lua")
end

MsgC(Color(251, 184, 41), "[FoxedBot] Initialized!\n")