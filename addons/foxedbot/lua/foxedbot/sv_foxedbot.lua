require("bromsock")
util.AddNetworkString("FoxedBot_Chat")

FoxedBot.callbacks = {}
FoxedBot.sock = BromSock(BROMSOCK_UDP)

--[[
	This callback is called whenever a UDP packet is received on port <FoxedBot.ServerPort>.
	It also makes sure that the packet is coming from the SteamBot.
]]--
FoxedBot.sock:SetCallbackReceiveFrom(function( sockObj, packet, ip, port )
	local msg = packet:ReadStringAll()

	if type(msg) == "string" then
		local args = string.Explode("////", msg)
		local serverKey = args[1] or "unknown"
		local steamID = args[2] or "unknown"
		local name = args[3] or "unknown"
		local callback = args[4] or "unknown"
		local data = args[5] or "unknown"

		if serverKey == FoxedBot.ServerKey then
			if FoxedBot.callbacks[callback] then
				FoxedBot.callbacks[callback](steamID, name, data)
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
		error("bad argument #2 to 'addCallback' (function expected, got "..type(name)..")")
	end

	FoxedBot.callbacks[name] = func
end

--[[
	Removes a callback from the callbacks list.
]]--
function FoxedBot.removeCallback( name )
	if type(name) != "string" then
		error("bad argument #1 to 'addCallback' (string expected, got "..type(name)..")")
	end

	FoxedBot.callbacks[name] = nil
end

--[[
	Returns true if the state of the socket is 2 or 7.
]]--
function FoxedBot.isReady()
	if FoxedBot.sock:GetState() != 2 or FoxedBot.sock:GetState() != 7 then
		return false
	end

	return true
end

--[[
	The chat callback is called whenever a message should be printed in chat.
]]--
FoxedBot.addCallback("chat", function( steamID, name, message )
	local data = {
		name = name,
		message = message
	}
	net.Start("FoxedBot_Chat")
	net.WriteTable(data)
	net.Send(player.GetAll())
end)