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
FoxedBot.announcements = {}
FoxedBot.announcement = false

surface.CreateFont("FoxedBot_Title", {
	font = "Trebuchet MS", 
	size = 30, 
	weight = 500, 
	blursize = 0, 
	scanlines = 0, 
	antialias = true
})

local PANEL = {}

function PANEL:Init()
	self.title = self:Add("DLabel")
	self.title:SetPos(5, 0)
	self.title:SetColor(Color(255, 255, 255))
	self.title:SetExpensiveShadow(1, Color(0, 0, 0))
	self.title:SetContentAlignment(7)
	self.title:SetFont("FoxedBot_Title")
	self.title:SetText("Announcement")
	self.title:SizeToContents()

	self.text = markup.Parse("Hello World!", ScrW() * 0.3125 - 10)

	self:SetSize(ScrW() * 0.3125, self.text:GetHeight() + 40)
end

function PANEL:Paint( w, h )
	local gradient = surface.GetTextureID("gui/gradient")
	surface.SetDrawColor( 0, 0, 0, 255 )
	surface.SetTexture( gradient )
	surface.DrawTexturedRect( 0, 0, w, h )
	self.text:Draw(10, 35, TEXT_ALIGN_LEFT, TEXT_ALIGN_BOTTOM)
end

function PANEL:SetText( text )
	self.text = markup.Parse(text, ScrW() * 0.3125 - 10)
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
				pan:MoveTo(ScrW() * -0.3125, ScrH() * 0.1388, 0.5, 20, 0.5, function( anim, pan )
					pan:Remove()
					FoxedBot.announcement = false
				end)
				pan:AlphaTo(0, 0.5, 20)
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