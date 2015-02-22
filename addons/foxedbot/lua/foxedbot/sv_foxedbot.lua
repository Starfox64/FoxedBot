require("bromsock")
util.AddNetworkString("FoxedBot_Chat")
util.AddNetworkString("FoxedBot_Announce")

FoxedBot.callbacks = {}
FoxedBot.sock = BromSock()
FoxedBot.client = BromSock()

--[[
	This callback is called whenever a TCP packet is received on port <FoxedBot.ServerPort>.
	It also makes sure that the packet is coming from the SteamBot.
]]--
FoxedBot.sock:SetCallbackAccept(function( serversock, clientsock )
	if clientsock:GetIP() == FoxedBot.BotIP then
		clientsock:SetCallbackReceive(function( sockObj, packet )
			local msg = packet:ReadStringAll()

			if msg then
				local args = util.JSONToTable(msg)

				if args then
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
						MsgC(Color(200, 25, 25), "[FoxedBot] Received a packet containing the wrong ServerKey.\n")
					end
				else
					MsgC(Color(200, 25, 25), "[FoxedBot] Received an invalid packet.\n")
				end
			end

			clientsock:Receive()
		end)

		clientsock:Receive()
	end

	FoxedBot.sock:Accept()
end)

function FoxedBot.listen()
	if FoxedBot.sock:Listen(FoxedBot.ServerPort) then
		MsgC(Color(25, 200, 25), "[FoxedBot] Listening on port "..FoxedBot.ServerPort..".\n")
		FoxedBot.sock:Accept()
	else
		MsgC(Color(200, 25, 25), "[FoxedBot] Failed to listen on port "..FoxedBot.ServerPort..".\n")
	end
end

FoxedBot.listen()

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

	FoxedBot.client:SetCallbackConnect(function( sockObj, ret, ip, port )
		if not ret then
			MsgC(Color(25, 200, 25), "[FoxedBot] Failed to connect to the SteamBot.\n")
			return
		end
		
		FoxedBot.client:Send(packet)
	end)

	if FoxedBot.client:GetState() != 7 then
		FoxedBot.client:Connect(FoxedBot.BotIP, FoxedBot.BotPort)
	else
		FoxedBot.client:Send(packet)
	end
end

--[[
	Sends a <message> to <steamID> (SteamID64!).
]]--
FoxedBot.client:SetCallbackSend(function() end)

function FoxedBot.sendMessage( steamID, message )
	if type(steamID) != "string" then
		error("bad argument #1 to 'sendMessage' (string expected, got "..type(steamID)..")")
	elseif type(message) != "string" then
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


	if FoxedBot.client:GetState() != 7 then
		FoxedBot.client:Connect(FoxedBot.BotIP, FoxedBot.BotPort)
	else
		FoxedBot.client:Send(packet)
	end
	
	FoxedBot.client:SetCallbackConnect(function( sockObj, ret, ip, port )
		if not ret then
			MsgC(Color(25, 200, 25), "[FoxedBot] Failed to connect to the SteamBot.\n")
			return
		end
		
		FoxedBot.client:Send(packet)
	end)

	if FoxedBot.client:GetState() != 7 then
		FoxedBot.client:Connect(FoxedBot.BotIP, FoxedBot.BotPort)
	else
		FoxedBot.client:Send(packet)
	end
end

--[[
	Utility function to quickly find a player by his name.
]]--
function FoxedBot.findPlayer( name )
	name = string.lower(name)

	for _, ply in pairs(player.GetAll()) do
		if string.find(string.lower(ply:Name()), name) then
			return ply
		end
	end
end

--[[
	Server only command that disconnects all sockets and forces the server to listen again.
]]--
concommand.Add("foxedbot_reload", function ( ply )
	if IsValid(ply) and not ply:IsListenServerHost() and not game.SinglePlayer() then
		ply:PrintMessage(HUD_PRINTCONSOLE, "This is a server-only console command!")
		return
	end

	MsgC(Color(251, 184, 41), "[FoxedBot] Reloading sockets...\n")

	FoxedBot.sock:Disconnect()
	FoxedBot.client:Disconnect()
	FoxedBot.listen()
end)
