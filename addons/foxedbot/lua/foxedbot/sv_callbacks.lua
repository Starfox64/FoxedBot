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