--[[
	The chat callback is called whenever a message should be printed in chat.
]]--
FoxedBot.addCallback("chat", function( data )
	net.Start("FoxedBot_Chat")
	net.WriteTable(data)
	net.Send(player.GetAll())
end)