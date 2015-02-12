--[[
	Handles event hooked to the chat.
]]--
hook.Add("PlayerSay", "FoxedBot_PlayerSay", function( ply, text )
	if FoxedBot.AdminCaller then
		if string.sub(text, 1, string.len(FoxedBot.AdminCallerCommand)) == FoxedBot.AdminCallerCommand then
			if not ply.FB_ACC or ply.FB_ACC > CurTime() then
				local message = string.sub(text, string.len(FoxedBot.AdminCallerCommand) + 1)
				if string.StartWith(message, " ") then
					message = string.sub(message, 2)
				end

				if string.len(message) < FoxedBot.AdminCallerMin then
					ply:SendLua('chat.AddText(Color(251, 184, 41), "Your message is too short, it should have at least '..FoxedBot.AdminCallerMin..' characters!")')
					return ""
				end

				local data = {
					name = ply:Name(),
					text = message
				}

				FoxedBot.sendEvent("OnAdminCall", data)

				ply.FB_ACC = CurTime() + FoxedBot.AdminCallerCooldown
			else
				ply:SendLua('chat.AddText(Color(251, 184, 41), "You need to wait '..math.Round(CurTime() - ply.FB_ACC)..' seconds before being able to send another message!")')
			end

			return ""
		end
	end

	if FoxedBot.SendChat then
		local data = {
			name = ply:Name(),
			text = text
		}

		FoxedBot.sendEvent("OnChat", data)
	end
end)

--[[
	Tells the bot when a player is killed.
]]--
hook.Add("PlayerDeath", "FoxedBot_PlayerDeath", function ( victim, entity, killer )
	if FoxedBot.LogDeaths then
		local text

		if victim == killer then
			text = victim:Name().." ["..victim:SteamID().."] killed himself."
		elseif killer:IsPlayer() then
			text = victim:Name().." ["..victim:SteamID().."] was killed by "..killer:Name().." ["..killer:SteamID().."] using "..entity:GetClass().."."
		else
			text = victim:Name().." ["..victim:SteamID().."] was killed by the world."
		end

		local data = {
			text = text
		}

		FoxedBot.sendEvent("OnLog", data)
	end
end)

hook.Add("PlayerConnect", "FoxedBot_PlayerConnect", function ( name, ip )
	if FoxedBot.LogConnections then
		local text = name.." ["..ip.."] connected to the server."
		local data = {
			text = text
		}

		FoxedBot.sendEvent("OnLog", data)
	end
end)

hook.Add("PlayerDisconnected", "FoxedBot_PlayerDisconnected", function ( ply )
	if FoxedBot.LogConnections then
		local text = ply:Name().." ["..ply:SteamID().."] disconnected from the server."
		local data = {
			text = text
		}

		FoxedBot.sendEvent("OnLog", data)
	end
end)