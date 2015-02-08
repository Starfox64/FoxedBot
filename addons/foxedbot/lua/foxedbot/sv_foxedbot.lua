require("bromsock")
util.AddNetworkString("FoxedBot_Chat")
util.AddNetworkString("FoxedBot_Announce")

--FixedBot.waitingList = {}
FoxedBot.callbacks = {}
FoxedBot.sock = BromSock(BROMSOCK_UDP)
FoxedBot.client = BromSock(BROMSOCK_UDP)

--[[
	This callback is called whenever a UDP packet is received on port <FoxedBot.ServerPort>.
	It also makes sure that the packet is coming from the SteamBot.
]]--
FoxedBot.sock:SetCallbackReceiveFrom(function( sockObj, packet, ip, port )
	local msg = packet:ReadStringAll()

	if type(msg) == "string" then
		local args = util.JSONToTable(msg)

		local serverKey = args[1] or "unknown"
		local callback = args[2] or "unknown"
		local data = args[3] or {}

		if serverKey == FoxedBot.ServerKey then
			if FoxedBot.callbacks[callback] then
				FoxedBot.callbacks[callback](data)
			else
				MsgC(Color(200, 25, 25), "[FoxedBot] Attempted to call an unknown callback! ("..callback..")\n")
			end
		else
			MsgC(Color(200, 25, 25), "[FoxedBot] "..ip.." attempted to send a packet to the server with the wrong password.\n")
		end
	end

	FoxedBot.sock:ReceiveFrom()
end)

FoxedBot.sock:Bind(FoxedBot.ServerPort)
FoxedBot.sock:ReceiveFrom()

--[[
	Adds a callback to the callbacks list.
]]--
function FoxedBot.addCallback( name, func )
	if type(name) != "string" then
		error("bad argument #1 to 'addCallback' (string expected, got "..type(name)..")")
	elseif type(func) != "function" then
		error("bad argument #2 to 'addCallback' (function expected, got "..type(func)..")")
	end

	FoxedBot.callbacks[name] = func
end

--[[
	Removes a callback from the callbacks list.
]]--
function FoxedBot.removeCallback( name )
	if type(name) != "string" then
		error("bad argument #1 to 'removeCallback' (string expected, got "..type(name)..")")
	end

	FoxedBot.callbacks[name] = nil
end

--[[
	Sends an event to the SteamBot with the event <name> and a table containing <data>.
]]--
function FoxedBot.sendEvent( name, data )
	if type(name) != "string" then
		error("bad argument #1 to 'sendEvent' (string expected, got "..type(name)..")")
	elseif type(data) != "table" then
		error("bad argument #2 to 'sendEvent' (table expected, got "..type(data)..")")
	end

	local tbl = {
		FoxedBot.ServerKey,
		FoxedBot.ServerID,
		"Event",
		name,
		data
	}

	local toSend = util.TableToJSON(tbl)
	local packet = BromPacket()

	packet:WriteStringRaw(toSend)
	FoxedBot.client:SendTo(packet, FoxedBot.BotIP, FoxedBot.BotPort)
end

--[[
	Sends a <message> to <steamID> (SteamID64!).
]]--
function FoxedBot.sendMessage( steamID, message )
	if type(steamID) != "string" then
		error("bad argument #1 to 'sendMessage' (string expected, got "..type(steamID)..")")
	elseif type(data) != "string" then
		error("bad argument #2 to 'sendMessage' (string expected, got "..type(message)..")")
	end

	local tbl = {
		FoxedBot.ServerKey,
		FoxedBot.ServerID,
		"Message",
		steamID,
		message
	}

	local toSend = util.TableToJSON(tbl)
	local packet = BromPacket()

	packet:WriteStringRaw(toSend)
	FoxedBot.client:SendTo(packet, FoxedBot.BotIP, FoxedBot.BotPort)
end