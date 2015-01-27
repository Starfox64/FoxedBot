net.Receive("FoxedBot_Chat", function()
	local data = net.ReadTable()
	chat.AddText(Color(63, 154, 191), "[FoxedBot] ", Color(111, 160, 165), data.name, Color(255, 255, 255), ": ", data.message)
end)