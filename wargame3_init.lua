-- wargame3 server mms protocol
-- tcp.port == 10002 || udp.port == 10002 || tcp.port == 10811

p_wargame3_mms = Proto("wargame3_mms", "WARGAME3_MMS")

local f_wargame3_mms = p_wargame3_mms.fields

function p_wargame3_mms.dissector(tvb, pinfo, tree)
  if tvb:len() == 0 then return  end
  
  pinfo.cols.protocol = p_wargame3_mms.name
  -- subtree = tree:add(p_wargame3_mms, tvb(0))
  pos = 0
  local commandCode = {
    [0x2fe1] = Dissector.get("wargame3_init"),
	[0xdde1] = Dissector.get("wargame3_mms_dde1"),
	[0xa5c1] = Dissector.get("wargame3_mms_a5c1"),
	[0x89e2] = Dissector.get("wargame3_mms_89e2"),
	[0x0ae2] = Dissector.get("wargame3_mms_0ae2")
  }
  
  local dissector = commandCode[tvb(pos,3):uint()]
  
  if dissector ~= nil then
  	local dissectorSize = dissector:call(tvb(pos):tvb(), pinfo, tree)
  end
end

function p_wargame3_mms.init()
end

local tcp_dissector_table = DissectorTable.get("tcp.port")
tcp_dissector_table:add(10002, p_wargame3_mms)
tcp_dissector_table:add(10811, p_wargame3_mms)

-- Create wargame3 server mms initiation protocol
-- "wargame3_init" : 프로토콜 이름. Filter 창 등에서 사용
-- "WARGAME3_INIT" : Packet Detail, List의 Protocol 컬럼에 표시될 프로토콜 Description
p_wargame3_init = Proto("wargame3_init", "WARGAME3_INIT");

local f = p_wargame3_init.fields

-- Field 정의
--   HEADER 공통
--    STARTCODE Field 정의
f.startcode = ProtoField.uint16("wargame3_init.startcode", "STARTCODE", base.HEX)

--    Port Field 정의
f.port = ProtoField.uint16("wargame3_init.port","PORT", base.DEC)

--    Unknown1 Field 정의
f.unknown1 = ProtoField.uint32("wargame3_init.unknown1","UNKNOWN1", base.DEC)

--    SrcIP Field 정의
f.srcip = ProtoField.ipv4("wargame3_init.srcip","SrcIP")

-- Eugen ID str len Field 정의
f.eugenIdLen = ProtoField.uint32("wargame3_init.eugenidLen","EugenIDLen")
--    EugenID 정의
f.eugenid = ProtoField.string("wargame3_init.eugenid","EugenID")

-- DedicatedKey str len Field 정의
f.dedicatedkeyLen = ProtoField.uint32("wargame3_init.dedicatedkeyLen","DedicatedKeyLen")

--    DedicatedKey 정의
f.dedicatedkey = ProtoField.string("wargame3_init.dedicatedkey", "DedicatedKey")

-- wargame3_init dissector function
function p_wargame3_init.dissector(buffer, pinfo, tree)
  -- walidate packet length is adequate, otherwise quit
  if buffer:len() == 0 then return end
  
  ---------------------
  -- 패킷 상세정보 창에 SubTree 추가하기
  ---------------------
  subtree = tree:add(p_wargame3_init, buffer(0))
  
  -- STARTCODE 값
  -- buffer의 첫번째 byte부터 3byte만큼을 startcode field에 적용.
  subtree:add(f.startcode, buffer(0,3))
  -- Port Field : 4byte부터 2bytes
  subtree:add_le(f.port, buffer(3,2))
  -- Unknown1 : 6byte부터 4bytes
  subtree:add(f.unknown1, buffer(5,4))
  subtree:add_le(f.srcip, buffer(9,4))
  subtree:add(f.eugenIdLen, buffer(14,4))
  local eugenIdLen = buffer(14,4):uint()
  local eugenIdPos = 18
  subtree:add(f.eugenid, buffer(eugenIdPos, eugenIdLen))
  local dedicatedkeyPos = eugenIdPos + eugenIdLen + 4
  subtree:add(f.dedicatedkeyLen, buffer(eugenIdPos + eugenIdLen,4))
  local dedicatedkeyLen = buffer(eugenIdPos + eugenIdLen,4):uint()
  subtree:add(f.dedicatedkey, buffer(dedicatedkeyPos,dedicatedkeyLen))
  
  -- 패킷 목록 표시창 info 컬럼에 표시될 정보
  -- Protocol 컬럼에 표시될 프로토콜 이름 지정
  -- "WARGAME3_INIT" 으로 선정
  pinfo.cols.protocol = p_wargame3_init.name
  
  -- Info 컬럼에 표시될 프로토콜 정보 문자열 생성
  
  local info_str = "";
  info_str = info_str..tostring(buffer(9,4):le_ipv4())..":"
  info_str = info_str..buffer(3,2):le_uint().." "
  info_str = info_str..buffer(eugenIdPos, eugenIdLen):string().." "
  info_str = info_str..buffer(dedicatedkeyPos,dedicatedkeyLen):string()
  pinfo.cols.info = info_str

end

function p_wargame3_init.init()
end


-- wargame3_mms_dde1 for commandCode is 0xdde1
p_wargame3_mms_dde1 = Proto("wargame3_mms_dde1", "WARGAME3_MMS_dde1")
local f_wargame3_mms_dde1 = p_wargame3_mms_dde1.fields
f_wargame3_mms_dde1.commandCode = ProtoField.uint16("wargame3_mms_dde1.commandCode", "COMMANDCODE", base.HEX)
f_wargame3_mms_dde1.unknown1 = ProtoField.uint8("wargame3_mms_dde1.unknown1", "UNKNOWN1",base.HEX)
f_wargame3_mms_dde1.stringLen = ProtoField.uint32("wargame3_mms_dde1.stringLen", "StringLen", base.DEC)
f_wargame3_mms_dde1.string = ProtoField.string("wargame3_mms_dde1.string", "STRING")
f_wargame3_mms_dde1.unknown2 = ProtoField.uint16("wargame3_mms_dde1.unknown2", "UNKNOWN2", base.HEX)
f_wargame3_mms_dde1.port = ProtoField.uint16("wargame3_mms_dde1.port", "PORT", base.DEC)
f_wargame3_mms_dde1.srcip = ProtoField.ipv4("wargame3_mms_dde1.srcip", "SrcIP")

function p_wargame3_mms_dde1.dissector(tvb, pinfo, tree)
  if tvb:len() == 0 then return end
  subtree = tree:add(p_wargame3_mms_dde1, tvb(0))
  local pos = 0
  subtree:add(f_wargame3_mms_dde1.commandCode, tvb(pos, 3))
  pos = pos + 3
  subtree:add(f_wargame3_mms_dde1.unknown1, tvb(pos, 1))
  pos = pos + 1
  subtree:add(f_wargame3_mms_dde1.stringLen, tvb(pos, 4))
  local stringLen = tvb(pos, 4):uint()
  pos = pos + 4
  subtree:add(f_wargame3_mms_dde1.string, tvb(pos, stringLen))
  pos = pos + stringLen
  subtree:add(f_wargame3_mms_dde1.unknown2, tvb(pos, 2))
  pos = pos + 2
  subtree:add_le(f_wargame3_mms_dde1.port, tvb(pos, 2))
  pos = pos + 2
  subtree:add_le(f_wargame3_mms_dde1.srcip, tvb(pos, 4))
  pos = pos + 4
end

-- wargame3_mms_a5c1 for commandCode is 0xdde1
p_wargame3_mms_a5c1 = Proto("wargame3_mms_a5c1", "WARGAME3_MMS_a5c1")
local f_wargame3_mms_a5c1 = p_wargame3_mms_a5c1.fields
f_wargame3_mms_a5c1.commandCode = ProtoField.uint16("wargame3_mms_a5c1.commandCode", "COMMANDCODE", base.HEX)
f_wargame3_mms_a5c1.unknown1 = ProtoField.uint32("wargame3_mms_a5c1.unknown1", "UNKNOWN1",base.HEX)
f_wargame3_mms_a5c1.EugNetId = ProtoField.uint32("wargame3_mms_a5c1.EugNetId", "EugNetId", base.DEC)
f_wargame3_mms_a5c1.unknwon3 = ProtoField.bytes("wargame3_mms_a5c1.unknwon3", "UNKNOWN3")
f_wargame3_mms_a5c1.VersionLen = ProtoField.uint32("wargame3_mms_a5c1.VersionLen", "VersionLen")
f_wargame3_mms_a5c1.Version = ProtoField.string("wargame3_mms_a5c1.Version", "VERSION")
f_wargame3_mms_a5c1.unknwon4 = ProtoField.uint8("wargame3_mms_a5c1.unknwon4", "UNKNOWN4")
f_wargame3_mms_a5c1.PlayerNameLen = ProtoField.uint32("wargame3_mms_a5c1.PlayerNameLen","PlayerNameLen")
f_wargame3_mms_a5c1.PlayerName = ProtoField.string("wargame3_mms_a5c1.PlayerName","PlayerName")

function p_wargame3_mms_a5c1.dissector(tvb, pinfo, tree)
  if tvb:len() == 0 then return end
  subtree = tree:add(p_wargame3_mms_a5c1, tvb(0))
  local pos = 0
  subtree:add(f_wargame3_mms_a5c1.commandCode, tvb(pos, 3))
  pos = pos + 3
  subtree:add(f_wargame3_mms_a5c1.unknown1, tvb(pos, 4))
  pos = pos + 4
  subtree:add(f_wargame3_mms_a5c1.EugNetId, tvb(pos,4))
  pos = pos + 4
  subtree:add(f_wargame3_mms_a5c1.unknwon3, tvb(pos,128))
  pos = pos + 128
  subtree:add(f_wargame3_mms_a5c1.VersionLen, tvb(pos, 4))
  local VersionLen = tvb(pos, 4):uint()
  pos = pos + 4
  subtree:add(f_wargame3_mms_a5c1.Version, tvb(pos, VersionLen))
  pos = pos + VersionLen
  subtree:add(f_wargame3_mms_a5c1.unknwon4, tvb(pos, 1))
  pos = pos + 1
  subtree:add(f_wargame3_mms_a5c1.PlayerNameLen, tvb(pos, 4))
  local PlayerNameLen = tvb(pos, 4):uint()
  pos = pos + 4
  subtree:add(f_wargame3_mms_a5c1.PlayerName, tvb(pos, PlayerNameLen))
  pos = pos + PlayerNameLen
end


-- wargame3_mms_89e2 for commandCode is 0xdde1
p_wargame3_mms_89e2 = Proto("wargame3_mms_89e2", "WARGAME3_MMS_89e2")
local f_wargame3_mms_89e2 = p_wargame3_mms_89e2.fields
f_wargame3_mms_89e2.commandCode = ProtoField.uint16("wargame3_mms_89e2.commandCode", "COMMANDCODE", base.HEX)
f_wargame3_mms_89e2.unknown1 = ProtoField.uint32("wargame3_mms_89e2.unknown1", "UNKNOWN1",base.HEX)
f_wargame3_mms_89e2.EugNetId = ProtoField.uint32("wargame3_mms_89e2.EugNetId", "EugNetId", base.DEC)
f_wargame3_mms_89e2.unknwon3 = ProtoField.bytes("wargame3_mms_89e2.unknwon3", "UNKNOWN3")

function p_wargame3_mms_89e2.dissector(tvb, pinfo, tree)
  if tvb:len() == 0 then return end
  subtree = tree:add(p_wargame3_mms_89e2, tvb(0))
  local pos = 0
  subtree:add(f_wargame3_mms_89e2.commandCode, tvb(pos, 3))
  pos = pos + 3
  subtree:add(f_wargame3_mms_89e2.unknown1, tvb(pos, 4))
  pos = pos + 4
  subtree:add(f_wargame3_mms_89e2.EugNetId, tvb(pos,4))
  pos = pos + 4
  subtree:add(f_wargame3_mms_89e2.unknwon3, tvb(pos,128))
  pos = pos + 128
end

-- wargame3_mms_0ae2 for commandCode is 0xdde1
p_wargame3_mms_0ae2 = Proto("wargame3_mms_0ae2", "WARGAME3_MMS_0ae2")
local f_wargame3_mms_0ae2 = p_wargame3_mms_0ae2.fields
f_wargame3_mms_0ae2.commandCode = ProtoField.uint16("wargame3_mms_0ae2.commandCode", "COMMANDCODE", base.HEX)
f_wargame3_mms_0ae2.unknown1 = ProtoField.uint32("wargame3_mms_0ae2.unknown1", "UNKNOWN1",base.HEX)
f_wargame3_mms_0ae2.EugNetId = ProtoField.uint32("wargame3_mms_0ae2.EugNetId", "EugNetId", base.DEC)
f_wargame3_mms_0ae2.unknown2 = ProtoField.uint8("wargame3_mms_0ae2.unknown2", "UNKNOWN2", base.HEX)

function p_wargame3_mms_0ae2.dissector(tvb, pinfo, tree)
  if tvb:len() == 0 then return end
  subtree = tree:add(p_wargame3_mms_0ae2, tvb(0))
  local pos = 0
  subtree:add(f_wargame3_mms_0ae2.commandCode, tvb(pos, 3))
  pos = pos + 3
  subtree:add(f_wargame3_mms_0ae2.unknown1, tvb(pos, 4))
  pos = pos + 4
  subtree:add(f_wargame3_mms_0ae2.EugNetId, tvb(pos,4))
  pos = pos + 4
  subtree:add(f_wargame3_mms_0ae2.unknown2, tvb(pos,1))
  pos = pos + 1
end

-- wargame3_mms_0ae2 for commandCode is 0xdde1
p_wargame3_mms_0ae2 = Proto("wargame3_mms_0ae2", "WARGAME3_MMS_0ae2")
local f_wargame3_mms_0ae2 = p_wargame3_mms_0ae2.fields
f_wargame3_mms_0ae2.commandCode = ProtoField.uint16("wargame3_mms_0ae2.commandCode", "COMMANDCODE", base.HEX)
f_wargame3_mms_0ae2.unknown1 = ProtoField.uint32("wargame3_mms_0ae2.unknown1", "UNKNOWN1",base.HEX)
f_wargame3_mms_0ae2.EugNetId = ProtoField.uint32("wargame3_mms_0ae2.EugNetId", "EugNetId", base.DEC)
f_wargame3_mms_0ae2.unknown2 = ProtoField.uint8("wargame3_mms_0ae2.unknown2", "UNKNOWN2", base.HEX)

function p_wargame3_mms_0ae2.dissector(tvb, pinfo, tree)
  if tvb:len() == 0 then return end
  subtree = tree:add(p_wargame3_mms_0ae2, tvb(0))
  local pos = 0
  subtree:add(f_wargame3_mms_0ae2.commandCode, tvb(pos, 3))
  pos = pos + 3
  subtree:add(f_wargame3_mms_0ae2.unknown1, tvb(pos, 4))
  pos = pos + 4
  subtree:add(f_wargame3_mms_0ae2.EugNetId, tvb(pos,4))
  pos = pos + 4
  subtree:add(f_wargame3_mms_0ae2.unknown2, tvb(pos,1))
  pos = pos + 1
end

