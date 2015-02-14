--[[
	Prints a message from the SteamBot to the chat.
]]--
net.Receive("FoxedBot_Chat", function()
	local data = net.ReadTable()
	chat.AddText(Color(63, 154, 191), "[FoxedBot] ", Color(111, 160, 165), data.name, Color(255, 255, 255), ": ", data.message)
end)

--[[
	Draws an announcement.
]]--
-- ShowTime: How long are announcements displayed.
FoxedBot.ShowTime = 30
FoxedBot.announcements = {}
FoxedBot.announcement = false

surface.CreateFont("FoxedBot_Title", {
	font = "Architects Daughter",
	size = 30,
	weight = 500,
	antialias = true
})

surface.CreateFont("FoxedBot_Text", {
	font = "Architects Daughter",
	size = 20,
	weight = 300,
	antialias = true
})

local PANEL = {}

function PANEL:Init()
	self.text = markup.Parse("Hello World!", ScrW() * 0.3125 - 10)
	self:SetSize(ScrW() * 0.3125, self.text:GetHeight() + 40)
end

function PANEL:Paint( w, h )
	surface.SetDrawColor(0, 0, 0, 255)
	surface.SetTexture(surface.GetTextureID("gui/gradient"))
	surface.DrawTexturedRect(0, 0, w, h)

	surface.SetFont("FoxedBot_Title")
	surface.SetTextColor(Color(255, 255, 255))
	surface.SetTextPos(5, 0)
	surface.DrawText("Announcement")

	self.text:Draw(10, 35, TEXT_ALIGN_LEFT, TEXT_ALIGN_BOTTOM)
end

function PANEL:SetText( text )
	self.text = markup.Parse("<font=FoxedBot_Text>"..text.."</font>", ScrW() * 0.3125 - 10)
	self:SetSize(ScrW() * 0.3125, self.text:GetHeight() + 40)
end

vgui.Register("FoxedBot_Announce", PANEL, "DPanel")

hook.Add("Think", "FoxedBot_AnnounceThink", function()
	for k, v in pairs(FoxedBot.announcements) do
		if not FoxedBot.announcement then
			local panel = vgui.Create("FoxedBot_Announce")
			FoxedBot.announcement = true
			panel:SetPos(ScrW() * -0.3125, ScrH() * 0.1388)
			panel:SetText(v)
			panel:SetAlpha(0)
			panel:MoveTo(0, ScrH() * 0.1388, 0.5, 0, 0.5, function( anim, pan )
				pan:MoveTo(ScrW() * -0.3125, ScrH() * 0.1388, 0.5, FoxedBot.ShowTime, 0.5, function( anim, pan )
					pan:Remove()
					FoxedBot.announcement = false
				end)
				pan:AlphaTo(0, 0.5, FoxedBot.ShowTime)
			end)
			panel:AlphaTo(255, 0.5)
			surface.PlaySound("garrysmod/save_load2.wav")
			table.remove(FoxedBot.announcements, k)
		end
	end
end)

net.Receive("FoxedBot_Announce", function()
	local text = net.ReadString()
	table.insert(FoxedBot.announcements, text)
	MsgC(Color(111, 160, 165), "FoxedBot Announcement:\n"..text.."\n")
end)