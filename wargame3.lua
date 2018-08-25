-- wargame3 protocol

-- mms use Remote Port 10002
--  Receive : tcp.srcport == 10002
--  Send : tcp.dstport == 10002
-- server use local Port 10811(from server setting)
--  Receive : tcp.dstport == 10811
-- Send : tcp.srcport == 10811

-- filer : 
-- tcp.port == 10002 || udp.port == 10002 || tcp.port == 10811 || udp.port == 10811
p_wargame3 = Proto("wargame3", "WARGAME3")

local f_wargame3 = p_wargame3.fields
--f_wargame3.CommandLen = ProtoField.uint16("wargame3.CommandLen", "CommandLen", base.DEC)
f_wargame3.UnknownCommandLen = ProtoField.uint16("wargame3.UnknownCommandLen", "commandLen", base.DEC)
f_wargame3.UnknownCommand = ProtoField.uint8("wargame3.UnknownCommand", "UnknownCommand",base.HEX)
f_wargame3.Unknown1 = ProtoField.bytes("wargame3.Unknown1", "Unknown1")

function p_wargame3.dissector(tvb, pinfo, tree)
  if tvb:len() == 0 then return end
  subtree = tree:add(p_wargame3, tvb(0))
  pinfo.cols.protocol = p_wargame3.name
  pos = 0
  -- only lower case
  local commandCode = {
    [0xe1] = Dissector.get("wargame3_e1"),
	[0xc1] = Dissector.get("wargame3_c1"),
	[0xe2] = Dissector.get("wargame3_e2"),
	[0xc9] = Dissector.get("wargame3_c9"),
	[0xc2] = Dissector.get("wargame3_c2"),
	[0xcb] = Dissector.get("wargame3_cb"),
	[0xca] = Dissector.get("wargame3_ca"),
	[0xc5] = Dissector.get("wargame3_c5"),
	[0xcd] = Dissector.get("wargame3_cd"),
	[0xce] = Dissector.get("wargame3_ce"),
	[0xc8] = Dissector.get("wargame3_c8"),
	[0xd0] = Dissector.get("wargame3_d0")
  }
  
  while pos < tvb:len() do
	local commandLen = tvb(pos, 2):uint()
	-- subtree:add(f_wargame3.commandLen , tvb(pos,2)); pos = pos + 2
	local dissector = commandCode[tvb(pos+2,1):uint()]
	if dissector ~= nil then
	  local dissectorSize = dissector:call(tvb(pos,2 + commandLen):tvb(), pinfo, tree)
	else
	  local dissector_unknown = Dissector.get("wargame3_unknown")
	  local dissectorSize = dissector_unknown:call(tvb(pos,2 + commandLen):tvb(), pinfo, tree)
	end
    pos = pos + 2 + commandLen
  end
  return
end

local tcp_dissector_table = DissectorTable.get("tcp.port")
tcp_dissector_table:add(10002, p_wargame3)
tcp_dissector_table:add(10810, p_wargame3)
tcp_dissector_table:add(10811, p_wargame3)
tcp_dissector_table:add(10813, p_wargame3)
tcp_dissector_table:add(10821, p_wargame3)
tcp_dissector_table:add(10822, p_wargame3)



--------------------------------------
-- wargame3_unknown
--------------------------------------
p_wargame3_unknown = Proto("wargame3_unknown", "WARGAME3_Unknown")
local f_wargame3_unknown = p_wargame3_unknown.fields
f_wargame3_unknown.UnknownCommandLen = ProtoField.uint16("wargame3_unknown.UnknownCommandLen", "commandLen", base.DEC)
f_wargame3_unknown.UnknownCommand = ProtoField.uint8("wargame3_unknown.UnknownCommand", "UnknownCommand",base.HEX)
f_wargame3_unknown.Unknown1 = ProtoField.bytes("wargame3_unknown.Unknown1", "Unknown1")

function p_wargame3_unknown.dissector(tvb, pinfo, tree)
  if tvb:len() == 0 then return end
  subtree = tree:add(p_wargame3_unknown, tvb(0))
  local pos = 0
  local CommandLen = tvb(pos, 2):uint()
  subtree:add(f_wargame3_unknown.UnknownCommandLen, tvb(pos, 2))
  subtree:add(f_wargame3_unknown.UnknownCommand, tvb(pos + 2, 1))
  subtree:add(f_wargame3_unknown.Unknown1, tvb(pos + 3,CommandLen-1))
end

--------------------------------------
-- wargame3_e1 : commandCode == 0xe1, Port == 10002
--------------------------------------
p_wargame3_e1 = Proto("wargame3_e1", "WARGAME3_e1")
local f_wargame3_e1 = p_wargame3_e1.fields
f_wargame3_e1.CommandLen = ProtoField.uint16("wargame3_e1.CommandLen", "CommandLen", base.DEC)
f_wargame3_e1.CommandCode = ProtoField.uint8("wargame3_e1.CommandCode", "CommandCode", base.HEX)
-- Send to MMS server(tcp.dstport == 10002)
f_wargame3_e1.ServerPort = ProtoField.uint16("wargame3_e1.ServerPort", "ServerPort", base.DEC)
f_wargame3_e1.Unknown1 = ProtoField.uint32("wargame3_e1.Unknown1", "Unknown1", base.DEC)
f_wargame3_e1.ServerIP = ProtoField.ipv4("wargame3_e1.ServerIP", "ServerIP")
f_wargame3_e1.Unknown4 = ProtoField.uint8("wargame3_e1.Unknown4", "Unknown4")
f_wargame3_e1.EugNetIdLen = ProtoField.uint32("wargame3_e1.EugNetIdLen", "EugNetIdLen", base.DEC)
f_wargame3_e1.EugNetId = ProtoField.string("wargame3_e1.EugNetId", "EugNetId")
f_wargame3_e1.DedicatedKeyLen = ProtoField.uint32("wargame3_e1.DedicatedKeyLen", "DedicatedKeyLen", base.DEC)
f_wargame3_e1.DedicatedKey = ProtoField.string("wargame3_e1.DedicatedKey", "DedicatedKey")
-- Receive from MMS server(tcp.srcport == 10002)
f_wargame3_e1.Unknown2 = ProtoField.uint8("wargame3_e1.Unknown2", "Unknown2", base.HEX)
f_wargame3_e1.StringLen = ProtoField.uint32("wargame3_e1.StringLen", "StringLen", base.DEC)
f_wargame3_e1.String = ProtoField.string("wargame3_e1.String", "String")
f_wargame3_e1.Unknown3 = ProtoField.uint16("wargame3_e1.Unknown3", "Unknown3", base.HEX)
-- f_wargame3_e1.ServerPort
-- f_wargame3_e1.ServerIP

function p_wargame3_e1.dissector(tvb, pinfo, tree)
  if tvb:len() == 0 then return end
  subtree = tree:add(p_wargame3_e1, tvb(0))
  local pos = 0
  subtree:add(f_wargame3_e1.CommandLen, tvb(pos, 2)); pos = pos + 2
  subtree:add(f_wargame3_e1.CommandCode, tvb(pos, 1)); pos = pos + 1
  if pinfo.dst_port == 10002 then
	subtree:add_le(f_wargame3_e1.ServerPort, tvb(pos, 2)); pos = pos + 2
	subtree:add(f_wargame3_e1.Unknown1, tvb(pos, 4)); pos = pos + 4
	subtree:add_le(f_wargame3_e1.ServerIP, tvb(pos, 4)); pos = pos + 4
	subtree:add(f_wargame3_e1.Unknown4, tvb(pos, 1)); pos = pos + 1
	local EugNetIdLen = tvb(pos, 4):uint()
	subtree:add(f_wargame3_e1.EugNetIdLen, tvb(pos, 4)); pos = pos + 4
    subtree:add(f_wargame3_e1.EugNetId, tvb(pos, EugNetIdLen)); pos = pos + EugNetIdLen
	local DedicatedKeyLen = tvb(pos, 4):uint()
	subtree:add(f_wargame3_e1.DedicatedKeyLen, tvb(pos, 4)); pos = pos + 4
	subtree:add(f_wargame3_e1.DedicatedKey, tvb(pos, DedicatedKeyLen)); pos = pos + DedicatedKeyLen
  elseif pinfo.src_port == 10002 then
    subtree:add(f_wargame3_e1.Unknown2, tvb(pos, 1)); pos = pos + 1
    local StringLen = tvb(pos, 4):uint()
	subtree:add(f_wargame3_e1.StringLen, tvb(pos, 4)); pos = pos + 4
	subtree:add(f_wargame3_e1.String, tvb(pos, StringLen)); pos = pos + StringLen
	subtree:add(f_wargame3_e1.Unknown3, tvb(pos, 2)); pos = pos + 2
	subtree:add_le(f_wargame3_e1.ServerPort, tvb(pos, 2)); pos = pos + 2
	subtree:add_le(f_wargame3_e1.ServerIP, tvb(pos, 4)); pos = pos + 4
  else return end
end


--------------------------------------
-- wargame3_c1 : commandCode == 0xc1, Port == 10811 //steel 에러
--------------------------------------
p_wargame3_c1 = Proto("wargame3_c1", "WARGAME3_c1")
local f_wargame3_c1 = p_wargame3_c1.fields
f_wargame3_c1.CommandLen = ProtoField.uint16("wargame3_c1.CommandLen", "CommandLen", base.DEC)
f_wargame3_c1.CommandCode = ProtoField.uint8("wargame3_c1.CommandCode", "CommandCode", base.HEX)
-- Receive from Client (tcp.dstport == 10811)
f_wargame3_c1.Unknown1 = ProtoField.uint32("wargame3_c1.Unknown1", "Unknown1",base.HEX)
f_wargame3_c1.EugNetId = ProtoField.uint32("wargame3_c1.EugNetId", "EugNetId", base.DEC)
f_wargame3_c1.Unknown3 = ProtoField.bytes("wargame3_c1.Unknown3", "Unknown3")
f_wargame3_c1.VersionLen = ProtoField.uint32("wargame3_c1.VersionLen", "VersionLen")
f_wargame3_c1.Version = ProtoField.string("wargame3_c1.Version", "Version")
f_wargame3_c1.Unknown4 = ProtoField.uint8("wargame3_c1.Unknown4", "Unknown4")
f_wargame3_c1.PlayerNameLen = ProtoField.uint32("wargame3_c1.PlayerNameLen","PlayerNameLen")
f_wargame3_c1.PlayerName = ProtoField.string("wargame3_c1.PlayerName","PlayerName")
-- Send to Client (tcp.srcport == 10811)
f_wargame3_c1.Unknown5 = ProtoField.uint32("wargame3_c1.Unknown5", "Unknown5", base.DEC)
f_wargame3_c1.Unknown6 = ProtoField.uint8("wargame3_c1.Unknown6", "Unknown6" , base.HEX)
f_wargame3_c1.Unknown7 = ProtoField.uint32("wargame3_c1.Unknown7", "Unknown7", base.Hex)

function p_wargame3_c1.dissector(tvb, pinfo, tree)
  if tvb:len() == 0 then return end
  subtree = tree:add(p_wargame3_c1, tvb(0))
  local pos = 0
  subtree:add(f_wargame3_c1.CommandLen, tvb(pos, 2)); pos = pos + 2
  subtree:add(f_wargame3_c1.CommandCode, tvb(pos, 1)); pos = pos + 1
  if pinfo.dst_port == 10811 or pinfo.dst_port == 10810  or pinfo.dst_port == 10813 or pinfo.dst_port == 10821 or pinfo.dst_port == 10821 then
    subtree:add(f_wargame3_c1.Unknown1, tvb(pos, 4)); pos = pos + 4
	subtree:add(f_wargame3_c1.EugNetId, tvb(pos, 4)); pos = pos + 4
	subtree:add(f_wargame3_c1.Unknown3, tvb(pos, 128)); pos = pos + 128
	local VersionLen = tvb(pos, 4):uint()
	subtree:add(f_wargame3_c1.VersionLen, tvb(pos, 4)); pos = pos + 4
	subtree:add(f_wargame3_c1.Version, tvb(pos, VersionLen)); pos = pos + VersionLen
	subtree:add(f_wargame3_c1.Unknown4, tvb(pos, 1)); pos = pos + 1
	local PlayerNameLen = tvb(pos, 4):uint()
	subtree:add(f_wargame3_c1.PlayerNameLen, tvb(pos, 4)); pos = pos + 4
	subtree:add(f_wargame3_c1.PlayerName, tvb(pos, PlayerNameLen)); pos = pos + PlayerNameLen
  elseif pinfo.src_port == 10811 or pinfo.src_port == 10810 or pinfo.src_port == 10813 or pinfo.src_port == 10821 then
    subtree:add(f_wargame3_c1.Unknown5, tvb(pos, 4)); pos = pos + 4
	subtree:add(f_wargame3_c1.Unknown6, tvb(pos, 1)); pos = pos + 1
	subtree:add(f_wargame3_c1.Unknown7, tvb(pos, 4)); pos = pos + 4
  else return end
end


--------------------------------------
-- wargame3_e2 : commandCode == 0xe2, Port == 10002
--------------------------------------
p_wargame3_e2 = Proto("wargame3_e2", "WARGAME3_e2")
local f_wargame3_e2 = p_wargame3_e2.fields
f_wargame3_e2.CommandLen = ProtoField.uint16("wargame3_e2.CommandLen", "CommandLen", base.DEC)
f_wargame3_e2.CommandCode = ProtoField.uint8("wargame3_e2.CommandCode", "CommandCode", base.HEX)
-- Send to MMS server(tcp.dstport == 10002)
f_wargame3_e2.Unknown1 = ProtoField.uint32("wargame3_e2.Unknown1", "Unknown1", base.HEX)
f_wargame3_e2.EugNetId = ProtoField.uint32("wargame3_e2.EugNetId", "EugNetId",base.DEC)
f_wargame3_e2.Unknown2 = ProtoField.bytes("wargame3_e2.Unknown2", "Unknown2")
-- Receive from MMS server(tcp.srcport == 10002)
-- f_wargame3_e2.Unknown1
-- f_wargame3_e2.EugNetId
f_wargame3_e2.Unknown3 = ProtoField.bytes("wargame3_e2.Unknown2", "Unknown3")

function p_wargame3_e2.dissector(tvb, pinfo, tree)
  if tvb:len() == 0 then return end
  subtree = tree:add(p_wargame3_e2, tvb(0))
  local pos = 0
  subtree:add(f_wargame3_e2.CommandLen, tvb(pos, 2)); pos = pos + 2
  subtree:add(f_wargame3_e2.CommandCode, tvb(pos, 1)); pos = pos + 1
  if pinfo.dst_port == 10002 then
    subtree:add(f_wargame3_e2.Unknown1, tvb(pos, 4)); pos = pos + 4
	subtree:add(f_wargame3_e2.EugNetId, tvb(pos, 4)); pos = pos + 4
	subtree:add(f_wargame3_e2.Unknown2, tvb(pos, 128)); pos = pos + 128
  elseif pinfo.src_port == 10002 then
    subtree:add(f_wargame3_e2.Unknown1, tvb(pos, 4)); pos = pos + 4
	subtree:add(f_wargame3_e2.EugNetId, tvb(pos, 4)); pos = pos + 4
	subtree:add(f_wargame3_e2.Unknown3, tvb(pos, 1)); pos = pos + 1
  else return end
end


--------------------------------------
-- wargame3_c9 : commandCode == 0xc9, Port == 10811
--------------------------------------
p_wargame3_c9 = Proto("wargame3_c9", "WARGAME3_c9")
local f_wargame3_c9 = p_wargame3_c9.fields
f_wargame3_c9.CommandLen = ProtoField.uint16("wargame3_c9.CommandLen", "CommandLen", base.DEC)
f_wargame3_c9.CommandCode = ProtoField.uint8("wargame3_c9.CommandCode", "CommandCode", base.HEX)
-- Receive from Client (tcp.dstport == 10811)
-- None
-- Send to Client (tcp.srcport == 10811)
f_wargame3_c9.VariableLen = ProtoField.uint32("wargame3_c9.VariableLen", "VariableLen", base.DEC)
f_wargame3_c9.Variable = ProtoField.string("wargame3_c9.Variable", "Variable")
f_wargame3_c9.ValueLen = ProtoField.uint32("wargame3_c9.ValueLen", "ValueLen", base.DEC)
f_wargame3_c9.Value = ProtoField.string("wargame3_c9.Value", "Value")

function p_wargame3_c9.dissector(tvb, pinfo, tree)
  if tvb:len() == 0 then return end
  subtree = tree:add(p_wargame3_c9, tvb(0))
  local pos = 0
  subtree:add(f_wargame3_c9.CommandLen, tvb(pos, 2)); pos = pos + 2
  subtree:add(f_wargame3_c9.CommandCode, tvb(pos, 1)); pos = pos + 1
  if pinfo.dst_port == 10811 or pinfo.dst_port == 10810 or pinfo.dst_port == 10813 then
  elseif pinfo.src_port == 10811 or pinfo.src_port == 10810 or pinfo.src_port == 10813 or pinfo.src_port == 10821 or pinfo.src_port == 10821 or pinfo.src_port == 10822 then
    local VariableLen = tvb(pos, 4):uint()
	subtree:add(f_wargame3_c9.VariableLen, tvb(pos, 4)); pos = pos + 4
	subtree:add(f_wargame3_c9.Variable, tvb(pos, VariableLen)); pos = pos + VariableLen
	local ValueLen = tvb(pos, 4):uint()
	subtree:add(f_wargame3_c9.ValueLen, tvb(pos, 4)); pos = pos + 4
	subtree:add(f_wargame3_c9.Value, tvb(pos, ValueLen)); pos = pos + ValueLen
  else return end
end


--------------------------------------
-- wargame3_c2 : commandCode == 0xc2, Port == 10811
--------------------------------------
p_wargame3_c2 = Proto("wargame3_c2", "WARGAME3_c2")
local f_wargame3_c2 = p_wargame3_c2.fields
f_wargame3_c2.CommandLen = ProtoField.uint16("wargame3_c9.CommandLen", "CommandLen", base.DEC)
f_wargame3_c2.CommandCode = ProtoField.uint8("wargame3_c9.CommandCode", "CommandCode", base.HEX)
f_wargame3_c2.WhoSend = ProtoField.uint32("wargame3_c2.ToSend", "WhoSend", base.DEC)
f_wargame3_c2.EugNetId = ProtoField.uint32("wargame3_c2.EugNetId", "EugNetId",base.DEC)
f_wargame3_c2.Type = ProtoField.uint8("wargame3_c2.Type", "Type", base.HEX)
f_wargame3_c2.Unknown1 = ProtoField.uint24("wargame3_c2.Unknown1", "Unknown1", base.HEX)
f_wargame3_c2.ChatLength = ProtoField.uint16("wargame3_c2.ChatLength", "ChatLength", base.DEC)
f_wargame3_c2.Padding = ProtoField.uint8("wargame3_c2.Padding", "Padding", base.DEC)
f_wargame3_c2.Chat = ProtoField.string("wargame3_c2.Chat", "Chat")
f_wargame3_c2.Unknown2Buffer = ProtoField.bytes("wargame3_c2.Unknown2Buffer", "Unknown2Buffer")

function p_wargame3_c2.dissector(tvb, pinfo, tree)
  if tvb:len() == 0 then return end
  subtree = tree:add(p_wargame3_c2, tvb(0))
  local pos = 0
  local CommandLen = tvb(pos, 2):uint()
  subtree:add(f_wargame3_c9.CommandLen, tvb(pos, 2)); pos = pos + 2
  subtree:add(f_wargame3_c9.CommandCode, tvb(pos, 1)); pos = pos + 1
  local WhoSend = tvb(pos, 4):uint()
  subtree:add(f_wargame3_c2.WhoSend, tvb(pos, 4)); pos = pos + 4
  if WhoSend == 0 then
	subtree:add(f_wargame3_c2.EugNetId, tvb(pos, 4)); pos = pos + 4
  end
  local Type = tvb(pos, 1):uint()
  subtree:add(f_wargame3_c2.Type, tvb(pos, 1)); pos = pos + 1
  subtree:add(f_wargame3_c2.Unknown1, tvb(pos, 3)); pos = pos + 3
  if(Type == 101) then
    local ChatLength = tvb(pos, 2):uint()
    subtree:add(f_wargame3_c2.ChatLength, tvb(pos, 2)); pos = pos + 2
    subtree:add(f_wargame3_c2.Padding, tvb(pos, 1)); pos = pos + 1
    subtree:add(f_wargame3_c2.Chat, tvb(pos, ChatLength)); pos = pos + ChatLength
  else
    subtree:add(f_wargame3_c2.Unknown2Buffer, tvb(pos, CommandLen-pos+2)); pos = CommandLen+2
  end
end


--------------------------------------
-- wargame3_cb : commandCode == 0xCB, Port == 10811 RCON
--------------------------------------
p_wargame3_cb = Proto("wargame3_cb", "WARGAME3_CB")
local f_wargame3_cb = p_wargame3_cb.fields
f_wargame3_cb.CommandLen = ProtoField.uint16("wargame3_cb.CommandLen", "CommandLen", base.DEC)
f_wargame3_cb.CommandCode = ProtoField.uint8("wargame3_cb.CommandCode", "CommandCode", base.HEX)
f_wargame3_cb.RCONLen = ProtoField.uint32("wargame3_cb.RCONLen", "RCONLen", base.DEC)
f_wargame3_cb.RCONCommand = ProtoField.string("wargame3_cb.RCONLen", "RCONLen")

function p_wargame3_cb.dissector(tvb, pinfo, tree)
  if tvb:len() == 0 then return end
  subtree = tree:add(p_wargame3_cb, tvb(0))
  local pos = 0
  local CommandLen = tvb(pos, 2):uint()
  subtree:add(f_wargame3_cb.CommandLen, tvb(pos, 2)); pos = pos + 2
  subtree:add(f_wargame3_cb.CommandCode, tvb(pos, 1)); pos = pos + 1
  local RCONLen = tvb(pos, 4):uint()
  subtree:add(f_wargame3_cb.RCONLen, tvb(pos, 4)); pos = pos + 4
  subtree:add(f_wargame3_cb.RCONCommand, tvb(pos, RCONLen)); pos = pos + RCONLen
end


--------------------------------------
-- wargame3_ca : commandCode == 0xca, Port == 10811 Player status
--------------------------------------
p_wargame3_ca = Proto("wargame3_ca", "WARGAME3_CA")
local f_wargame3_ca = p_wargame3_ca.fields
f_wargame3_ca.CommandLen = ProtoField.uint16("wargame3_ca.CommandLen", "CommandLen", base.DEC)
f_wargame3_ca.CommandCode = ProtoField.uint8("wargame3_ca.CommandCode", "CommandCode", base.HEX)
f_wargame3_ca.PlayerNumber = ProtoField.uint32("wargame3_ca.PlayerNumber", "PlayerNumber", base.DEC)
f_wargame3_ca.PropertyLen = ProtoField.uint32("wargame3_ca.PropertyLen", "PropertyLen", base.DEC)
f_wargame3_ca.Property = ProtoField.string("wargame3_ca.Property", "Property")
f_wargame3_ca.ValueLen = ProtoField.uint32("wargame3_ca.ValueLen", "ValueLen", base.DEC)
f_wargame3_ca.Value = ProtoField.string("wargame3_ca.Value", "Value")

function p_wargame3_ca.dissector(tvb, pinfo, tree)
  if tvb:len() == 0 then return end
  subtree = tree:add(p_wargame3_ca, tvb(0))
  local pos = 0
  local CommandLen = tvb(pos, 2):uint()
  subtree:add(f_wargame3_ca.CommandLen, tvb(pos, 2)); pos = pos + 2
  subtree:add(f_wargame3_ca.CommandCode, tvb(pos, 1)); pos = pos + 1
  subtree:add(f_wargame3_ca.PlayerNumber, tvb(pos, 4)); pos = pos + 4
  local PropertyLen = tvb(pos, 4):uint()
  subtree:add(f_wargame3_ca.PropertyLen, tvb(pos, 4)); pos = pos + 4
  subtree:add(f_wargame3_ca.Property, tvb(pos, PropertyLen)); pos = pos + PropertyLen
  local ValueLen = tvb(pos, 4):uint()
  subtree:add(f_wargame3_ca.ValueLen, tvb(pos, 4)); pos = pos + 4
  subtree:add(f_wargame3_ca.Value, tvb(pos, ValueLen)); pos = pos + ValueLen
end

--------------------------------------
-- wargame3_c5 : commandCode == 0xc5, Port == 10811 
--------------------------------------
p_wargame3_c5 = Proto("wargame3_c5", "WARGAME3_C5")
local f_wargame3_c5 = p_wargame3_c5.fields
f_wargame3_c5.CommandLen = ProtoField.uint16("wargame3_c5.CommandLen", "CommandLen", base.DEC)
f_wargame3_c5.CommandCode = ProtoField.uint8("wargame3_c5.CommandCode", "CommandCode", base.HEX)
f_wargame3_c5.PlayerNumber = ProtoField.uint8("wargame3_c5.PlayerNumber", "PlayerNumber?", base.DEC)
f_wargame3_c5.TimerCounter = ProtoField.uint32("wargame3_c5.TimerCounter", "TimerCounter", base.DEC)

function p_wargame3_c5.dissector(tvb, pinfo, tree)
  if tvb:len() == 0 then return end
  subtree = tree:add(p_wargame3_c5, tvb(0))
  local pos = 0
  local CommandLen = tvb(pos, 2):uint()
  subtree:add(f_wargame3_c5.CommandLen, tvb(pos, 2)); pos = pos + 2
  subtree:add(f_wargame3_c5.CommandCode, tvb(pos, 1)); pos = pos + 1
  subtree:add(f_wargame3_c5.PlayerNumber, tvb(pos, 1)); pos = pos + 1
  subtree:add(f_wargame3_c5.TimerCounter, tvb(pos, 4)); pos = pos + 4
end

--------------------------------------
-- wargame3_c8 : commandCode == 0xc8, Port == 10811 PlayerNumber set //steel 에러
--------------------------------------
p_wargame3_c8 = Proto("wargame3_c8", "WARGAME3_C8")
local f_wargame3_c8 = p_wargame3_c8.fields
f_wargame3_c8.CommandLen = ProtoField.uint16("wargame3_c8.CommandLen", "CommandLen", base.DEC)
f_wargame3_c8.CommandCode = ProtoField.uint8("wargame3_c8.CommandCode", "CommandCode", base.HEX)
f_wargame3_c8.UnknownMod = ProtoField.uint8("wargame3_c8.UnknownMod", "UnknownMod")
f_wargame3_c8.Unknown1 = ProtoField.bytes("wargame3_c8.Unknown1", "Unknown1")
f_wargame3_c8.EugNetId = ProtoField.uint32("wargame3_c8.EugNetId", "EugNetId", base.DEC)
f_wargame3_c8.PlayerNumber = ProtoField.uint32("wargame3_c8.PlayerNumber", "PlayerNumber", base.DEC)
f_wargame3_c8.Unknown2 = ProtoField.uint8("wargame3_c8.Unknown2", "Unknown2")

function p_wargame3_c8.dissector(tvb, pinfo, tree)
  if tvb:len() == 0 then return end
  subtree = tree:add(p_wargame3_c8, tvb(0))
  local pos = 0
  local CommandLen = tvb(pos, 2):uint()
  subtree:add(f_wargame3_c8.CommandLen, tvb(pos, 2)); pos = pos + 2
  subtree:add(f_wargame3_c8.CommandCode, tvb(pos, 1)); pos = pos + 1
  subtree:add(f_wargame3_c8.UnknownMod, tvb(pos, 1)); pos = pos + 1
  subtree:add(f_wargame3_c8.Unknown1, tvb(pos, 4)); pos = pos + 4
  subtree:add(f_wargame3_c8.EugNetId, tvb(pos, 4)); pos = pos + 4
  subtree:add_le(f_wargame3_c8.PlayerNumber, tvb(pos, 4)); pos = pos + 4
  subtree:add(f_wargame3_c8.Unknown2, tvb(pos, 1)); pos = pos + 1
end

--------------------------------------
-- wargame3_cd : commandCode == 0xcd, Port == 10811 
--------------------------------------
p_wargame3_cd = Proto("wargame3_cd", "WARGAME3_CD")
local f_wargame3_cd = p_wargame3_cd.fields
f_wargame3_cd.CommandLen = ProtoField.uint16("wargame3_cd.CommandLen", "CommandLen", base.DEC)
f_wargame3_cd.CommandCode = ProtoField.uint8("wargame3_cd.CommandCode", "CommandCode", base.HEX)
f_wargame3_cd.GameState = ProtoField.uint32("wargame3_cd.GameState", "GameState", base.DEC)
f_wargame3_cd.TimeLeft = ProtoField.uint32("wargame3_cd.TimeLeft", "TimeLeft", base.DEC)
f_wargame3_cd.Unknown2 = ProtoField.uint32("wargame3_cd.Unknown2", "Unknown2", base.DEC)

function p_wargame3_cd.dissector(tvb, pinfo, tree)
  if tvb:len() == 0 then return end
  subtree = tree:add(p_wargame3_cd, tvb(0))
  local pos = 0
  local CommandLen = tvb(pos, 2):uint()
  subtree:add(f_wargame3_cd.CommandLen, tvb(pos, 2)); pos = pos + 2
  subtree:add(f_wargame3_cd.CommandCode, tvb(pos, 1)); pos = pos + 1
  local GameState = tvb(pos, 4):uint()
  subtree:add(f_wargame3_cd.GameState, tvb(pos, 4)); pos = pos + 4
  -- if GameState ~= 0x34 then -- Deploy complete / Player to Server는 Unknown2없음, Server to Player는 있음
  if pinfo.src_port == 10811 or pinfo.src_port == 10810 or pinfo.src_port == 10813 or pinfo.src_port == 10821 then
    subtree:add(f_wargame3_cd.TimeLeft, tvb(pos, 4)); pos = pos + 4
	subtree:add(f_wargame3_cd.Unknown2, tvb(pos, 4)); pos = pos + 4
  end
end

--------------------------------------
-- wargame3_ce : commandCode == 0xcd, Port == 10811 
--------------------------------------
p_wargame3_ce = Proto("wargame3_ce", "WARGAME3_CE")
local f_wargame3_ce = p_wargame3_ce.fields
f_wargame3_ce.CommandLen = ProtoField.uint16("wargame3_ce.CommandLen", "CommandLen", base.DEC)
f_wargame3_ce.CommandCode = ProtoField.uint8("wargame3_ce.CommandCode", "CommandCode", base.HEX)
f_wargame3_ce.PreGameState = ProtoField.uint32("wargame3_ce.PreGameState", "PreGameState", base.DEC)
f_wargame3_ce.PreGameState = ProtoField.uint32("wargame3_ce.PreGameState", "PreGameState", base.DEC)
f_wargame3_ce.Unknown1 = ProtoField.uint32("wargame3_ce.Unknown1", "Unknown2", base.DEC)

function p_wargame3_ce.dissector(tvb, pinfo, tree)
  if tvb:len() == 0 then return end
  subtree = tree:add(p_wargame3_ce, tvb(0))
  local pos = 0
  local CommandLen = tvb(pos, 2):uint()
  subtree:add(f_wargame3_ce.CommandLen, tvb(pos, 2)); pos = pos + 2
  subtree:add(f_wargame3_ce.CommandCode, tvb(pos, 1)); pos = pos + 1
  subtree:add(f_wargame3_ce.PreGameState, tvb(pos, 4)); pos = pos + 4
  subtree:add(f_wargame3_ce.PreGameState, tvb(pos, 4)); pos = pos + 4
  subtree:add(f_wargame3_ce.Unknown1, tvb(pos, 4)); pos = pos + 4
end

--------------------------------------
-- wargame3_d0 : commandCode == 0xd0, Port == 10811 
--------------------------------------
p_wargame3_d0 = Proto("wargame3_d0", "WARGAME3_D0")
local f_wargame3_d0 = p_wargame3_d0.fields
f_wargame3_d0.CommandLen = ProtoField.uint16("wargame3_d0.CommandLen", "CommandLen", base.DEC)
f_wargame3_d0.CommandCode = ProtoField.uint8("wargame3_d0.CommandCode", "CommandCode", base.HEX)
f_wargame3_d0.Unknown1 = ProtoField.uint32("wargame3_d0.Unknown1", "Unknown1", base.HEX)
f_wargame3_d0.EugNetId = ProtoField.uint32("wargame3_d0.EugNetId", "EugNetId", base.DEC)
f_wargame3_d0.Unknown2 = ProtoField.uint32("wargame3_d0.Unknown2", "Unknown2", base.HEX)


function p_wargame3_d0.dissector(tvb, pinfo, tree)
  if tvb:len() == 0 then return end
  subtree = tree:add(p_wargame3_d0, tvb(0))
  local pos = 0
  local CommandLen = tvb(pos, 2):uint()
  subtree:add(f_wargame3_d0.CommandLen, tvb(pos, 2)); pos = pos + 2
  subtree:add(f_wargame3_d0.CommandCode, tvb(pos, 1)); pos = pos + 1
  subtree:add(f_wargame3_d0.Unknown1, tvb(pos, 4)); pos = pos + 4
  subtree:add(f_wargame3_d0.EugNetId, tvb(pos, 4)); pos = pos + 4
  subtree:add(f_wargame3_d0.Unknown2, tvb(pos, 4)); pos = pos + 4  
end