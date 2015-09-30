require("bromsock")
util.AddNetworkString("FoxedBot_Chat")
util.AddNetworkString("FoxedBot_Announce")

FoxedBot.callbacks = {}
FoxedBot.sock = BromSock()
FoxedBot.retries = 0
FoxedBot.ready = false

FoxedBot.sock:Create()
FoxedBot.sock:SetOption(0xFFFF, 0x0008, 1)

--[[
	Sends the ServerKey and ServerID to the bot to authenticate the server.
]]--
function FoxedBot.auth( sockObj, succ, ip, port )
	if succ then
		local authData = {"AUTH", FoxedBot.ServerKey, FoxedBot.ServerID}
		authData = util.TableToJSON(authData)

		local packet = BromPacket()
		packet:WriteStringRaw(authData)

		FoxedBot.sock:Send(packet, true)
		FoxedBot.sock:ReceiveUntil("\3") -- Reads until the EndOfText control character.
	else
		MsgC(Color(200, 25, 25), "[FoxedBot] Connection Failed, retrying in 30 seconds...\n")

		timer.Simple(30, function()
			FoxedBot.sock:Connect(FoxedBot.BotIP, FoxedBot.BotPort)
		end)
	end
end

FoxedBot.sock:SetCallbackConnect(FoxedBot.auth)

FoxedBot.sock:SetCallbackReceive(function( sockObj, packet )
	local msg = packet:ReadStringAll()
	msg = string.sub(msg, 1, -2) -- Removes the EndOfText control character.

	if msg then
		local args = util.JSONToTable(msg)

		if args then
			local callback = args[1] or "unknown"
			local data = args[2] or {}

			if callback == "SYS" then -- Internal callback used for authentication.
				if data == "AUTHED" then
					FoxedBot.ready = true
					FoxedBot.retries = 0 -- Reset retries counter.

					MsgC(Color(25, 200, 25), "[FoxedBot] Connected to FoxedBot.\n")
				elseif data == "DENIED" then
					FoxedBot.ready = false

					if (FoxedBot.retries < 2) then
						MsgC(Color(200, 25, 25), "[FoxedBot] Connection Denied, retrying...\n")
						FoxedBot.auth(nil, true) -- resend the auth data to the bot.
					else
						MsgC(Color(200, 25, 25), "[FoxedBot] Connection Denied, out of retries, your ServerKey is most likely wrong!\n")
						FoxedBot.sock:Disconnect()
					end

					return
				end
			elseif FoxedBot.callbacks[callback] then
				FoxedBot.callbacks[callback](data)
			else
				MsgC(Color(200, 25, 25), "[FoxedBot] Attempted to call an unknown callback! ("..callback..")\n")
			end
		else
			MsgC(Color(200, 25, 25), "[FoxedBot] Received an invalid packet.\n")
		end
	end

	FoxedBot.sock:ReceiveUntil("\3")
end)

FoxedBot.sock:SetCallbackDisconnect(function()
	MsgC(Color(200, 25, 25), "[FoxedBot] Disconnected!\n")
	if FoxedBot.ready then
		FoxedBot.ready = false
		FoxedBot.sock:Disconnect()
		FoxedBot.sock:Connect(FoxedBot.BotIP, FoxedBot.BotPort)
	end
end)

FoxedBot.sock:Connect(FoxedBot.BotIP, FoxedBot.BotPort)

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
		"Event",
		name,
		data
	}

	local toSend = util.TableToJSON(tbl)
	local packet = BromPacket()
	packet:WriteStringRaw(toSend)

	if FoxedBot.sock:GetState() == 7 and FoxedBot.ready then
		FoxedBot.sock:Send(packet, true)
	end
end

--[[
	Sends a <message> to <steamID> (SteamID64!).
]]--
function FoxedBot.sendMessage( steamID, message )
	if type(steamID) != "string" then
		error("bad argument #1 to 'sendMessage' (string expected, got "..type(steamID)..")")
	elseif type(message) != "string" then
		error("bad argument #2 to 'sendMessage' (string expected, got "..type(message)..")")
	end

	local tbl = {
		"Message",
		steamID,
		message
	}

	local toSend = util.TableToJSON(tbl)
	local packet = BromPacket()
	packet:WriteStringRaw(toSend)

	if FoxedBot.sock:GetState() == 7 and FoxedBot.ready then
		FoxedBot.sock:Send(packet, true)
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
	Server only command that forces the server to reconnect to FoxedBot.
]]--
concommand.Add("foxedbot_reload", function ( ply )
	if IsValid(ply) and not ply:IsListenServerHost() and not game.SinglePlayer() then
		ply:PrintMessage(HUD_PRINTCONSOLE, "This is a server-only console command!")
		return
	end

	MsgC(Color(251, 184, 41), "[FoxedBot] Reloading connection...\n")

	FoxedBot.sock:Disconnect()
	FoxedBot.sock:Connect(FoxedBot.BotIP, FoxedBot.BotPort)
end)

hook.Add("ShutDown", "FoxedBot_Disconnect", function()
	FoxedBot.sock:Disconnect()
end)