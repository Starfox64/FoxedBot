--[[
	Sends the server's chat to the SteamBot if SendChat is enabled.
]]--
if FoxedBot.SendChat then
	hook.Add("PlayerSay", "FoxedBot_PlayerSay", function( ply, text )
		local data = {
			name = ply:Name(),
			text = text
		}
		FoxedBot.sendEvent("OnChat", data)
	end)
end