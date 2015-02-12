--[[
	The OnChat callback is called whenever a message should be printed in chat.
]]--
FoxedBot.addCallback("OnChat", function( data )
	net.Start("FoxedBot_Chat")
	net.WriteTable(data)
	net.Send(player.GetAll())
end)

--[[
	The OnAnnounce callback is called whenever an announcement should be printed on screen.
]]--
FoxedBot.addCallback("OnAnnounce", function( data )
	net.Start("FoxedBot_Announce")
	net.WriteString(data.message)
	net.Send(player.GetAll())
end)

--[[
	The GetPlayers callback sends a list of players to the person who requested it.
]]--
FoxedBot.addCallback("GetPlayers", function( data )
	local text = "Server "..FoxedBot.ServerID.."'s players:"

	for _, ply in pairs(player.GetAll()) do
		text = text.."\n    "..ply:UserID()..". "..ply:Name()
	end

	FoxedBot.sendMessage(data.steamID, text)
end)

--[[
	The OnRCON callback is called whenever a console command should be ran.
]]--
FoxedBot.addCallback("OnRCON", function( data )
	game.ConsoleCommand(data.command.."\n")
	FoxedBot.sendMessage(data.steamID, data.command.." has been executed on server "..FoxedBot.ServerID..".")
end)

--[[
	The OnKick callback is called whenever a player should be kicked.
]]--
FoxedBot.addCallback("OnKick", function( data )
	local ply = FoxedBot.findPlayer(data.name)

	if ply then
		ply:Kick(data.reason)
		FoxedBot.sendMessage(data.steamID, ply:Name().." was kicked from server "..FoxedBot.ServerID..".")
	end
end)

--[[
	The OnKickID callback is called whenever a player should be kicked using their UserID().
]]--
FoxedBot.addCallback("OnKickID", function( data )
	local ply

	for _, v in pairs(player.GetAll()) do
		if v:UserID() == data.userID then
			ply = v
			break
		end
	end

	if ply then
		ply:Kick(data.reason)
		FoxedBot.sendMessage(data.steamID, ply:Name().." was kicked from server "..FoxedBot.ServerID..".")
	end
end)

--[[
	The OnBan callback is called whenever a player should be banned.
]]--
FoxedBot.addCallback("OnBan", function( data )
	local ply = FoxedBot.findPlayer(data.name)

	if ply then
		if FoxedBot.BanAddon == "ulx" then
			if ulx then
				ulx.ban(nil, ply, data.time, data.reason)
			else
				FoxedBot.sendMessage(data.steamID, "Server "..FoxedBot.ServerID.." attempted to use ULX, couldn't find it.")
				return
			end
		elseif FoxedBot.BanAddon == "evolve" then
			if evolve then
				evolve:Ban(ply:UniqueID(), data.time, data.reason, 0)
			else
				FoxedBot.sendMessage(data.steamID, "Server "..FoxedBot.ServerID.." attempted to use Evolve, couldn't find it.")
				return
			end
		elseif FoxedBot.BanAddon == "moderator" then
			if moderator then
				moderator.BanPlayer(ply:SteamID(), data.reason, data.time)
			else
				FoxedBot.sendMessage(data.steamID, "Server "..FoxedBot.ServerID.." attempted to use Moderator, couldn't find it.")
				return
			end
		else
			ply:Ban(data.time, true)
		end
		FoxedBot.sendMessage(data.steamID, ply:Name().." was banned from server "..FoxedBot.ServerID..".")
	end
end)

--[[
	The OnBanID callback is called whenever a player should be banned using his SteamID.
]]--
FoxedBot.addCallback("OnBanID", function( data )
	if FoxedBot.BanAddon == "ulx" then
		if ulx then
			ulx.banid(nil, data.target, data.time, data.reason)
		else
			FoxedBot.sendMessage(data.steamID, "Server "..FoxedBot.ServerID.." attempted to use ULX, couldn't find it.")
			return
		end
	elseif FoxedBot.BanAddon == "evolve" then
		if evolve then
			local uid = evolve:UniqueIDByProperty("SteamID", data.target)
			if uid then
				evolve:Ban(uid, data.time, data.reason, 0)
			end
		else
			FoxedBot.sendMessage(data.steamID, "Server "..FoxedBot.ServerID.." attempted to use Evolve, couldn't find it.")
			return
		end
	elseif FoxedBot.BanAddon == "moderator" then
		if moderator then
			moderator.BanPlayer(data.target, data.reason, data.time)
		else
			FoxedBot.sendMessage(data.steamID, "Server "..FoxedBot.ServerID.." attempted to use Moderator, couldn't find it.")
			return
		end
	else
		game.ConsoleCommand("kickid "..data.target.." Banned: "..data.reason.."\n")
		game.ConsoleCommand("banid "..data.time.." "..data.target.."\n")
		game.ConsoleCommand("writeid\n")
	end
	FoxedBot.sendMessage(data.steamID, data.target.." was banned from server "..FoxedBot.ServerID..".")
end)

--[[
	The OnBanID callback is called whenever a player should be banned using his SteamID.
]]--
FoxedBot.addCallback("OnUnban", function( data )
	if FoxedBot.BanAddon == "ulx" then
		if ulx then
			ulx.unban(nil, data.target)
		else
			FoxedBot.sendMessage(data.steamID, "Server "..FoxedBot.ServerID.." attempted to use ULX, couldn't find it.")
			return
		end
	elseif FoxedBot.BanAddon == "evolve" then
		if evolve then
			local uid = evolve:UniqueIDByProperty("SteamID", data.target)
			if uid then
				evolve:UnBan(uid, 0)
			end
		else
			FoxedBot.sendMessage(data.steamID, "Server "..FoxedBot.ServerID.." attempted to use Evolve, couldn't find it.")
			return
		end
	elseif FoxedBot.BanAddon == "moderator" then
		if moderator then
			moderator.RemoveBan(data.target)
		else
			FoxedBot.sendMessage(data.steamID, "Server "..FoxedBot.ServerID.." attempted to use Moderator, couldn't find it.")
			return
		end
	else
		game.ConsoleCommand("removeid "..data.target..";writeid\n")
	end
	FoxedBot.sendMessage(data.steamID, data.target.." was unbanned from server "..FoxedBot.ServerID..".")
end)