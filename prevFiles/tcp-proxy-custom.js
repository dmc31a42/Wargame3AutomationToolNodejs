var net = require("net");
var NodeConfig = require('./node-config');
var exec = require('child_process').exec;
const path = require('path');
var fs = require("fs");
net.bytesWritten = 5000;
net.bufferSize = 5000;

function executeRCON(command) {
	var execution_string = NodeConfig.rconPath + 
	    ' -H ' + NodeConfig.rconRemoteHost + 
	    ' -P ' + NodeConfig.rconRemotePort +
        " -p '" + NodeConfig.rconPassword + "'" +
		' "' + command + '"';
	
	var child = exec(execution_string, function (error, stdout, stderr) {
		//console.log('stdout: ' + stdout);
		//console.log('stderr: ' + stderr);
		//if (error !== null) {
		//	console.log('exec error: ' + error);
		//}
	});
}

class Wargame3_E1_Send {
    constructor(){
    }
    FromBuffer(data){
        var pos = 0;
        this.send = true;
        this.receive = false;
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        this.CommandCode = data.readUIntBE(pos, 1); pos+=1;
        this.ServerPort = data.readUIntLE(pos, 2); pos+=2;
        this.Version = data.readUIntBE(pos, 4); pos+=4;
        this.ServerIP = data.readUIntLE(pos, 4); pos+=4;
        this.Unknown2 = data.readUIntBE(pos, 1); pos+=1;
        this.EugNetIdLen = data.readUIntBE(pos, 4); pos+=4;
        this.EugNetId = data.toString('utf8', pos, pos+this.EugNetIdLen); pos+=this.EugNetIdLen;
        this.DedicatedKeyLen = data.readUIntBE(pos, 4); pos+=4;
        this.DedicatedKey = data.toString('utf8', pos, pos+this.DedicatedKeyLen); pos+=this.DedicatedKeyLen;
        return this;
    }
    getBuffer(){
        if(this.CommandCode){
            var EugNetId = Buffer.from(this.EugNetId);
            var EugNetIdLen = EugNetId.length;
            var DedicatedKey = Buffer.from(this.DedicatedKey);
            var DedicatedKeyLen = DedicatedKey.length;
            var length = 22+ EugNetIdLen + DedicatedKeyLen;
            var buf = new Buffer(length);
            var pos = 0;
            buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
            buf.writeUIntBE(this.CommandCode, pos, 1); pos+=1; // CommandCode
            buf.writeUIntLE(this.ServerPort, pos, 2); pos+=2; // ServerPort
            buf.writeUIntBE(this.Version, pos, 4); pos+=4; // Version
            buf.writeUIntLE(this.ServerIP, pos, 4); pos+=4; // ServerIP
            buf.writeUIntBE(this.Unknown2, pos, 1); pos+=1; // Unknown2
            buf.writeUIntBE(EugNetIdLen, pos, 4); pos+=4; // EugNetIdLen
            EugNetId.copy(buf, pos); pos+=EugNetIdLen; // EugNetId
            buf.writeUIntBE(DedicatedKeyLen, pos, 4); pos+=4; // DedicatedKeyLen
            DedicatedKey.copy(buf, pos); pos+=DedicatedKeyLen; // DedicatedKey
            return buf;
        } else {
            return ;
        }
    }
}

class Wargame3_E1_Receive {
    constructor(){}
    FromBuffer(data){
        var pos = 0;
        this.send = false;
        this.receive = true;
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        this.CommandCode = data.readUIntBE(pos, 1); pos+=1;
        this.Unknown1 = data.readUIntBE(pos, 1); pos+=1;
        this.StringLen = data.readUIntBE(pos, 4); pos+=4;
        this.String = data.toString('utf8', pos, pos+this.StringLen); pos+=this.StringLen;
        this.Unknown2 = data.readUIntBE(pos, 2); pos+=2;
        this.ServerPort = data.readUIntLE(pos, 2); pos+=2;
        this.ServerIP = data.readUIntLE(pos, 4); pos+=4;
        return this;
    }
    getBuffer(){
        if(this.CommandCode){
            var StringBuffer = Buffer.from(this.String);
            var StringLen = StringBuffer.length;
            var length = 16 + StringLen;
            var buf = new Buffer(length);
            var pos = 0;
            buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
            buf.writeUIntBE(this.CommandCode, pos, 1); pos+=1; // CommandCode
            buf.writeUIntBE(this.Unknown1, pos, 1); pos+=1;
            buf.writeUIntBE(this.StringLen, pos, 4); pos+=4;
            StringBuffer.copy(buf, pos); pos+=StringLen;
            buf.writeUIntBE(this.Unknown2, pos, 2); pos+=2;
            buf.writeUIntLE(this.ServerPort, pos, 2); pos+=2;
            buf.writeUIntLE(this.ServerIP, pos, 4); pos+=4;
            return buf;
        } else {
            return ;
        }
    }
}

class Wargame3_C2_All {
    constructor(){}
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = false;
        this.receive = true;
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        this.CommandCode = data.readUIntBE(pos, 1); pos+=1;
        this.WhoSend = data.readUIntBE(pos, 4); pos+=4;
        if(this.WhoSend == 0){
            this.EugNetId = data.readUIntBE(pos,4); pos+=4;
            this.send = true;
            this.receive = false;
        }
        this.Type = data.readUIntBE(pos, 1); pos+=1;
        if(this.Type == 0x65) {
            this.Unknown1 = data.readUIntBE(pos, 3); pos+=3;
            this.ChatLength = data.readUIntBE(pos, 2); pos+=2;
            this.Padding = data.readUIntBE(pos, 1); pos+=1;
            this.Chat = data.toString('utf8', pos, pos+this.ChatLength); pos+=this.ChatLength;
            this.Left = data.slice(pos, this.CommandLen+2);
        } else {
            this.Left = data.slice(pos, this.CommandLen+2);
        }
        return this;
    }
    getBuffer(){
        if(this.CommandCode){
            var buf = {};
            var length = 0;
            if(this.Type == 0x65){
                var chatBuffer = Buffer.from(this.Chat);
                if(this.WhoSend == 0){
                    if(this.Left){
                        length = 18+chatBuffer.length+this.Left.length;
                    } else {
                        length = 18+chatBuffer.length;
                    }
                } else {
                    if(this.Left){
                        length = 14+chatBuffer.length+this.Left.length;
                    } else {
                        length = 14+chatBuffer.length;
                    }
                }
                buf = new Buffer(length);
                var pos = 0;
                buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
                buf.writeUIntBE(this.CommandCode, pos, 1); pos+=1; // CommandCode
                buf.writeUIntBE(this.WhoSend, pos, 4); pos+=4;
                if(this.WhoSend==0){
                    buf.writeUIntBE(this.EugNetId, pos, 4); pos+=4;
                }
                buf.writeUIntBE(this.Type, pos, 1); pos+=1;
                buf.writeUIntBE(this.Unknown1, pos, 3); pos+=3;
                buf.writeUIntBE(chatBuffer.length, pos, 2); pos+=2;
                buf.writeUIntBE(this.Padding, pos, 1); pos+=1;
                chatBuffer.copy(buf, pos); pos+=chatBuffer.length;
                if(this.Left){
                    this.Left.copy(buf, pos);
                }
            } else {
                if(this.WhoSend == 0){
                    if(this.Left){
                        length = 12+this.Left.length;
                    } else {
                        length = 12;
                    }
                } else {
                    if(this.Left){
                        length = 8+this.Left.length;
                    } else {
                        length = 8;
                    }
                }  
                buf = new Buffer(length);
                var pos = 0;
                buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
                buf.writeUIntBE(this.CommandCode, pos, 1); pos+=1; // CommandCode
                buf.writeUIntBE(this.WhoSend, pos, 4); pos+=4;
                if(this.WhoSend==0){
                    buf.writeUIntBE(this.EugNetId, pos, 4); pos+=4;
                }
                buf.writeUIntBE(this.Type, pos, 1); pos+=1;
                if(this.Left){
                    this.Left.copy(buf, pos);
                }
            }
            return buf;
        } else {
            return ;
        }
    }
}

class Wargame3_C1_Receive {
    constructor(){}
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = false;
        this.receive = true;
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        this.CommandCode = data.readUIntBE(pos, 1); pos+=1;
        this.Unknown1 = data.readUIntBE(pos, 4); pos+=4;
        this.EugNetId = data.readUIntBE(pos, 4); pos+=4;
        this.Unknown2 = data.slice(pos, pos+128); pos+=128;
        this.VersionLen = data.readUIntBE(pos, 4); pos+=4;
        this.Version = data.toString('utf8', pos, pos+this.VersionLen); pos+=this.VersionLen;
        this.Unknown3 = data.readUIntBE(pos, 1); pos+=1;
        this.PlayerNameLen = data.readUIntBE(pos, 4); pos+=4;
        this.PlayerName = data.toString('utf8', pos, pos+this.PlayerNameLen); pos+=this.PlayerNameLen;
        return this;
    }
    getBuffer(){
        if(this.CommandCode){
            var Version = Buffer.from(this.Version);
            var VersionLen = Version.length;
            var PlayerName = Buffer.from(this.PlayerName);
            var PlayerNameLen = PlayerName.length;
            var Unknown2Len = this.Unknown2.length;
            var length = 20 + VersionLen + PlayerNameLen + Unknown2Len;
            var buf = new Buffer(length);
            var pos = 0;
            buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
            buf.writeUIntBE(this.CommandCode, pos, 1); pos+=1; // CommandCode
            buf.writeUIntBE(this.Unknown1, pos, 4); pos+=4;
            buf.writeUIntBE(this.EugNetId, pos, 4); pos+=4;
            this.Unknown2.copy(buf, pos); pos+=Unknown2Len;
            buf.writeUIntBE(VersionLen, pos, 4); pos+=4;
            Version.copy(buf, pos); pos+=VersionLen;
            buf.writeUIntBE(this.Unknown3, pos, 1); pos+=1;
            buf.writeUIntBE(PlayerNameLen, pos, 4); pos+=4;
            PlayerName.copy(buf, pos); pos+=PlayerNameLen;
            return buf;
        } else {
            return ;
        }
    }
}

class Wargame3_C1_Send {
    constructor(){}
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = false;
        this.receive = true;
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        this.CommandCode = data.readUIntBE(pos, 1); pos+=1;
        this.UserSessionId = data.readUIntBE(pos, 4); pos+=4;
        this.Unknown1 = data.slice(pos, pos+1); pos+=1; // Client:0x00, Obs: 0x35??
        this.ClientObsMod = data.slice(pos, pos+4); pos+=4; // i don't know exactly 1 byte / 4byte or 4byte / 1byte
        return this;
    }
    getBuffer(){
        if(this.CommandCode){
            var length = 12;
            var buf = new Buffer(length);
            var pos = 0;
            buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
            buf.writeUIntBE(this.CommandCode, pos, 1); pos+=1; // CommandCode
            buf.writeUIntBE(this.UserSessionId, pos, 4); pos+=4;
            buf.writeUIntBE(this.Unknown1, pos, 1); pos+=1;
            buf.writeUIntBE(this.ClientObsMod, pos, 4); pos+=4;
            return buf;
        } else {
            return ;
        }
    }
}

class Steel_C1_Receive {
    constructor(){}
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = false;
        this.receive = true;
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        this.CommandCode = data.readUIntBE(pos, 1); pos+=1;
        this.Unknown1 = data.readUIntBE(pos, 4); pos+=4;
        this.EugNetId = data.readUIntBE(pos, 4); pos+=4;
        this.Unknown2 = data.slice(pos, pos+128); pos+=128;
        this.VersionLen = data.readUIntBE(pos, 4); pos+=4;
        this.Version = data.toString('utf8', pos, pos+this.VersionLen); pos+=this.VersionLen;
        this.Unknown3 = data.readUIntBE(pos, 2); pos+=2;
        this.PlayerNameLen = data.readUIntBE(pos, 4); pos+=4;
        this.PlayerName = data.toString('utf8', pos, pos+this.PlayerNameLen); pos+=this.PlayerNameLen;
        return this;
    }
    getBuffer(){
        if(this.CommandCode){
            var Version = Buffer.from(this.Version);
            var VersionLen = Version.length;
            var PlayerName = Buffer.from(this.PlayerName);
            var PlayerNameLen = PlayerName.length;
            var Unknown2Len = this.Unknown2.length;
            var length = 21 + VersionLen + PlayerNameLen + Unknown2Len;
            var buf = new Buffer(length);
            var pos = 0;
            buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
            buf.writeUIntBE(this.CommandCode, pos, 1); pos+=1; // CommandCode
            buf.writeUIntBE(this.Unknown1, pos, 4); pos+=4;
            buf.writeUIntBE(this.EugNetId, pos, 4); pos+=4;
            this.Unknown2.copy(buf, pos); pos+=Unknown2Len;
            buf.writeUIntBE(VersionLen, pos, 4); pos+=4;
            Version.copy(buf, pos); pos+=VersionLen;
            buf.writeUIntBE(this.Unknown3, pos, 2); pos+=2;
            buf.writeUIntBE(PlayerNameLen, pos, 4); pos+=4;
            PlayerName.copy(buf, pos); pos+=PlayerNameLen;
            return buf;
        } else {
            return ;
        }
    }
}

class Steel_C1_Send {
    constructor(){}
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = false;
        this.receive = true;
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        this.CommandCode = data.readUIntBE(pos, 1); pos+=1;
        this.UserSessionId = data.readUIntBE(pos, 4); pos+=4;
        this.ClientObsMod = data.slice(pos, pos+4); pos+=4; // Client:0x00, Obs: 0x35
        return this;
    }
    getBuffer(){
        if(this.CommandCode){
            var length = 11;
            var buf = new Buffer(length);
            var pos = 0;
            buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
            buf.writeUIntBE(this.CommandCode, pos, 1); pos+=1; // CommandCode
            buf.writeUIntBE(this.UserSessionId, pos, 4); pos+=4;
            buf.writeUIntBE(this.ClientObsMod, pos, 4); pos+=4;
            return buf;
        } else {
            return ;
        }
    }
}

class Wargame3_C8_Send {
    constructor(){}
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = false;
        this.receive = true;
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        this.CommandCode = data.readUIntBE(pos, 1); pos+=1;
        this.UnknownMod = data.readUIntBE(pos, 1); pos+=1;
        this.Unknown1 = data.readUIntBE(pos, 4); pos+=4;
        this.EugNetId = data.readUIntBE(pos, 4); pos+=4;
        this.Unknown2 = data.readUIntBE(pos, 1); pos+=1;
        this.PlayerNumber = data.readUIntLE(pos, 4); pos+=4;
        return this;
    }
    getBuffer(){
        if(this.CommandCode){
            var length = 17;
            var buf = new Buffer(length);
            var pos = 0;
            buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
            buf.writeUIntBE(this.CommandCode, pos, 1); pos+=1; // CommandCode
            buf.writeUIntBE(this.UnknownMod, pos, 1); pos+=1;
            buf.writeUIntBE(this.Unknown1, pos, 4); pos+=4;
            buf.writeUIntBE(this.EugNetId, pos, 4); pos+=4;
            buf.writeUIntBE(this.Unknown2, pos, 1); pos+=1;
            buf.writeUIntLE(this.PlayerNumber, pos, 4); pos+=4;
            return buf;
        } else {
            return ;
        }
    }
}

class Steel_C8_Send {
    constructor(){}
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = false;
        this.receive = true;
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        this.CommandCode = data.readUIntBE(pos, 1); pos+=1;
        this.UnknownMod = data.readUIntBE(pos, 1); pos+=1;
        this.Unknown1 = data.readUIntBE(pos, 4); pos+=4;
        this.EugNetId = data.readUIntBE(pos, 4); pos+=4;
        this.PlayerNumber = data.readUIntLE(pos, 4); pos+=4;
        return this;
    }
    getBuffer(){
        if(this.CommandCode){
            var length = 16;
            var buf = new Buffer(length);
            var pos = 0;
            buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
            buf.writeUIntBE(this.CommandCode, pos, 1); pos+=1; // CommandCode
            buf.writeUIntBE(this.UnknownMod, pos, 1); pos+=1;
            buf.writeUIntBE(this.Unknown1, pos, 4); pos+=4;
            buf.writeUIntBE(this.EugNetId, pos, 4); pos+=4;
            buf.writeUIntLE(this.PlayerNumber, pos, 4); pos+=4;
            return buf;
        } else {
            return ;
        }
    }
}

class Wargame3_CA_Send {
    constructor(){}
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = false;
        this.receive = true;
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        this.CommandCode = data.readUIntBE(pos, 1); pos+=1;
        this.PlayerNumber = data.readUIntBE(pos, 4); pos+=4;
        this.PropertyLen = data.readUIntBE(pos, 4); pos+=4;
        this.Property = data.toString('utf8', pos, pos+this.PropertyLen); pos+=this.PropertyLen;
        this.ValueLen = data.readUIntBE(pos, 4); pos+=4;
        this.Value = data.toString('utf8', pos, pos+this.ValueLen); pos+=this.ValueLen;
        return this;
    }
    getBuffer(){
        if(this.CommandCode){
            var Property = Buffer.from(this.Property);
            var PropertyLen = Property.length;
            var Value = Buffer.from(this.Value);
            var ValueLen = Value.length;
            var length = 15 + PropertyLen + ValueLen;
            var buf = new Buffer(length);
            var pos = 0;
            buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
            buf.writeUIntBE(this.CommandCode, pos, 1); pos+=1; // CommandCode
            buf.writeUIntBE(this.PlayerNumber, pos, 4); pos+=4;
            buf.writeUIntBE(PropertyLen, pos, 4); pos+=4;
            Property.copy(buf, pos); pos+=PropertyLen;
            buf.writeUIntBE(ValueLen, pos, 4); pos+=4;
            Value.copy(buf, pos); pos+=ValueLen;
            return buf;
        } else {
            return ;
        }
    }
}

class Wargame3_C9_Send {
    constructor(){}
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = false;
        this.receive = true;
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        this.CommandCode = data.readUIntBE(pos, 1); pos+=1;
        this.PropertyLen = data.readUIntBE(pos, 4); pos+=4;
        this.Property = data.toString('utf8', pos, pos+this.PropertyLen); pos+=this.PropertyLen;
        this.ValueLen = data.readUIntBE(pos, 4); pos+=4;
        this.Value = data.toString('utf8', pos, pos+this.ValueLen); pos+=this.ValueLen;
        return this;
    }
    getBuffer(){
        if(this.CommandCode){
            var Property = Buffer.from(this.Property);
            var PropertyLen = Property.length;
            var Value = Buffer.from(this.Value);
            var ValueLen = Value.length;
            var length = 11 + PropertyLen + ValueLen;
            var buf = new Buffer(length);
            var pos = 0;
            buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
            buf.writeUIntBE(this.CommandCode, pos, 1); pos+=1; // CommandCode
            buf.writeUIntBE(PropertyLen, pos, 4); pos+=4;
            Property.copy(buf, pos); pos+=PropertyLen;
            buf.writeUIntBE(ValueLen, pos, 4); pos+=4;
            Value.copy(buf, pos); pos+=ValueLen;
            return buf;
        } else {
            return ;
        }
    }
}

class Wargame3_CF_Send {
    constructor(){}
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = false;
        this.receive = true;
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        this.CommandCode = data.readUIntBE(pos, 1); pos+=1;
        this.Padding = data.readUIntBE(pos, 4); pos+=4;
        this.Buffer = data.slice(pos);
        return this;
    }
    getBuffer(){
        if(this.CommandCode){
            var length = 7 + this.Buffer.length;
            var buf = new Buffer(length);
            var pos = 0;
            buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
            buf.writeUIntBE(this.CommandCode, pos, 1); pos+=1; // CommandCode
            buf.writeUIntBE(this.Padding, pos, 4); pos+=4;
            this.Buffer.copy(buf, pos); pos+=this.Buffer.length;
            return buf;
        } else {
            return ;
        }
    }
}

function uniqueKey(socket) {
    var key = socket.remoteAddress + ":" + socket.remotePort;
    return key;
}

function TcpProxy(proxyPort, serviceHost, servicePort, options) {
    this.proxyPort = proxyPort;
    this.serviceHost = serviceHost;
    this.servicePort = servicePort;
    if (options === undefined) {
        this.options = {
            quiet: false
        };
    } else {
        this.options = options;
    }
    this.proxySockets = {};

    this.createProxy();
}

TcpProxy.prototype.createProxy = function() {
    const proxy = this;
    proxy.server = net.createServer(function(proxySocket) {
        var key = uniqueKey(proxySocket);
        proxy.proxySockets[key] = proxySocket;
        var context = {
            buffers: [],
            connected: false,
            proxySocket: proxySocket,
            sentNotice: proxy.notices.length-1
        };    
        proxy.createServiceSocket(context);
        proxySocket.on("data", function(data) {
            var buffers = checkWargame3Send(data, context);
            buffers.forEach((element)=>{
                if (context.connected) {
                    context.serviceSocket.write(element);
                } else {
                    context.buffers[context.buffers.length] = element;
                }
                console.log("local >> proxy >> remote : ", element);
            });
        });
        proxySocket.on("close", function(hadError) {
            if(hadError){
                console.log(hadError);
            }
            delete proxy.proxySockets[uniqueKey(proxySocket)];
            context.serviceSocket.destroy();
        });
        proxySocket.on("error", function(e) {
            console.log(e);
            context.proxySocket.destroy();
        });
    });
    proxy.notices = [];
    function notice(){
        var notice = new Wargame3_C2_All();
        notice.Chat = "[공지]: 덱 코드를 채팅창에 그대로(공백이나 다른 내용이 있으면 안됨) 붙여넣고 엔터를 치시면 본인의 덱이 채팅에 입력한 덱으로 바뀝니다.";
        notice.ChatLength = 0;
        notice.CommandCode = 0xC2;
        notice.CommandLen = 0;
        notice.EugNetId = 986359;
        notice.Padding = 0;
        notice.receive = false;
        notice.send = true;
        notice.Type = 0x65;
        notice.Unknown1 = 65536;
        notice.WhoSend = 0;
        proxy.notices.push(notice);
    }
    notice();
    proxy.noticeInterval = setInterval(notice, 1*60*1000);
    proxy.server.listen(proxy.proxyPort, proxy.options.hostname);
};

TcpProxy.prototype.createServiceSocket = function(context) {
    const proxy = this;
    context.serviceSocket = new net.Socket();
    context.serviceSocket.connect(proxy.servicePort, proxy.serviceHost,
    function() {
        context.connected = true;
        if (context.buffers.length > 0) {
            for (var i = 0; i < context.buffers.length; i++) {
                context.serviceSocket.write(context.buffers[i]);
            }
        }
    });
    context.serviceSocket.on("data", function(data) {
        
        var buffers = checkWargame3Receive(data, context);
        buffers.forEach((element)=>{
            context.proxySocket.write(element);
            console.log("remote >> proxy >> local", element);
        })
        if(context.blockFromServer && ReplayFilePosition == 0){
            ReplayFileBuffer = fs.readFileSync(path.join("./replay_2018-03-01_21-56-19.wargamerpl2"));
            ReplayFilePosition = 0;
            context.replayInterval = setInterval(function(){
                var replayStart = new Wargame3_CF_Send();
                replayStart.CommandCode = 0xCF;
                replayStart.Padding = 0;
                replayStart.Buffer = ReplayFileBuffer.slice(ReplayFilePosition, ReplayFilePosition+1000);
                ReplayFilePosition+=1000;
                context.proxySocket.write(replayStart.getBuffer())
            }, 100);
        }
        if(proxy.proxyPort == 10810){
            for(var i=context.sentNotice; i+1<proxy.notices.length; i++){
                var noticeProtocol = proxy.notices[i+1];
                var buffer = noticeProtocol.getBuffer();
                context.proxySocket.write(buffer);
                console.log("remote >> proxy >> local notice");
                console.log(noticeProtocol);
                console.log(buffer);
                context.sentNotice = i+1;
            }
        }
    });
    context.serviceSocket.on("close", function(hadError) {
        if(hadError){
            console.log(hadError);
        }
        clearInterval(context.replayInterval)
        context.proxySocket.destroy();
    });
    context.serviceSocket.on("error", function(e) {
        console.log(e);
        clearInterval(context.replayInterval)
        context.proxySocket.destroy();
    });
    return context;
}

TcpProxy.prototype.end = function() {
    this.server.close();
    clearInterval(this.noticeInterval);
    for (var key in this.proxySockets) {
        this.proxySockets[key].destroy();
    }
    this.server.unref();
};

TcpProxy.prototype.log = function(msg) {
    if (!this.options.quiet) {
        console.log(msg);
    }
};

module.exports.createProxy = function(proxyPort,
serviceHost, servicePort, options) {
    return new TcpProxy(proxyPort, serviceHost, servicePort, options);
};

var ReplayFileBuffer;
var ReplayFilePosition = 0;
function checkWargame3Receive(data, context){
    var commandCode = [
        {code: 0xE1, class: Wargame3_E1_Receive},
        {code: 0xC2, class: Wargame3_C2_All},
        {code: 0xCA, class: Wargame3_CA_Send, modifyFunction:function(protocol){
            if(context.user.EugNetId == 986359 && protocol.Property == "PlayerObserver") {
                protocol.Value = "1";
                return [protocol];
            } else {
                return [protocol];
            }
        }},
        {code: 0xC8, class: Wargame3_C8_Send, preFunction:function(protocol){       
            if(protocol.UnknownMod==0){
                context.user.PlayerNumber = protocol.PlayerNumber;
            }
        }},
        {code: 0xC1, class: Wargame3_C1_Send, modifyFunction:function(protocol){
            if(context.user.EugNetId == 986359){
                context.blockFromServer = true;
                protocol.UserSessionId = 0xffffffff;
                protocol.Unknown1 = 0x35;
                protocol.ClientObsMod = 0x35;              
                return [protocol];
            } else {
                return [protocol];
            }
        }}
        
        
    ];
    var pos = 0;
    var buffers = [];
    if(context.blockFromServer){

    }
    else {
        while(pos<data.length){
            var slicedBuffer = data.slice(pos);
            if(slicedBuffer.length>=3){
                var index = commandCode.findIndex(function(element){
                    if(slicedBuffer[2] == element.code) return true;
                })
                var length = slicedBuffer.readUIntBE(0,2); 
                if(index>=0){
                    var wargame3Protocol = new commandCode[index].class().FromBuffer(slicedBuffer);
                    if(commandCode[index].preFunction){
                        commandCode[index].preFunction(wargame3Protocol);
                    }
                    if(commandCode[index].modifyFunction){
                        var modifiedProtocols = commandCode[index].modifyFunction(wargame3Protocol);
                        if(modifiedProtocols){
                            modifiedProtocols.forEach((element)=>{
                                var modifiedBuffer = element.getBuffer();
                                console.log('Wargame3Receive', element);
                                buffers.push(modifiedBuffer);
                            })
                            if(context.blockFromServer){
                                break;
                            }
                        }
                    } else {
                        console.log('Wargame3Receive', wargame3Protocol);
                        var wargame3Buffer = wargame3Protocol.getBuffer();
                        buffers.push(wargame3Buffer);
                    }
                } else {
                    buffers.push(slicedBuffer.slice(0, length+2));
                }
                pos+=(length+2);
            } else {
                buffers.push(slicedBuffer);
                pos+=slicedBuffer.length;
            }
        }
    }    
    return buffers;
}

function checkWargame3Send(data, context){
    var commandCode = [
        {code: 0xE1, class: Wargame3_E1_Send, modifyFunction:function(protocol){
            protocol.ServerPort = 10810
            return [protocol];
        }},
        {code: 0xC2, class: Wargame3_C2_All, preFunction:function(protocol){
            if(protocol.Type==0x65){
                const DeckRegExp = /^@(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/;
                if(DeckRegExp.exec(protocol.Chat)){
                    executeRCON('setpvar ' + context.user.EugNetId + ' ' + 'PlayerDeckContent ' + protocol.Chat);
                }
            }            
        }}, // Player->Proxy->Dedicated
        {code: 0xC1, class: Wargame3_C1_Receive, preFunction:function(protocol){
            context.user = {
                EugNetId: protocol.EugNetId,
                PlayerName: protocol.PlayerName
            }
        },modifyFunction:function(protocol){
            if(protocol.EugNetId == 986359){
                //protocol.Unknown3 = 2;
            }
            return [protocol];
        }} // Player->Proxy->Dedicated
    ];
    var pos = 0;
    var buffers = [];
    
    while(pos<data.length){
        var slicedBuffer = data.slice(pos);
        if(slicedBuffer.length>=3){
            var index = commandCode.findIndex(function(element){
                if(slicedBuffer[2] == element.code) return true;
            })
            var length = slicedBuffer.readUIntBE(0,2); 
            if(index>=0){
                var wargame3Protocol = new commandCode[index].class().FromBuffer(slicedBuffer);
                if(commandCode[index].preFunction){
                    commandCode[index].preFunction(wargame3Protocol);
                }
                if(commandCode[index].modifyFunction){
                    var modifiedProtocols = commandCode[index].modifyFunction(wargame3Protocol);
                    if(modifiedProtocols){
                        modifiedProtocols.forEach((element)=>{
                            var modifiedBuffer = element.getBuffer();
                            console.log('Wargame3Send', element);
                            buffers.push(modifiedBuffer);
                        })
                    }
                } else {
                    console.log('Wargame3Send', wargame3Protocol);
                    var wargame3Buffer = wargame3Protocol.getBuffer();
                    buffers.push(wargame3Buffer);
                    pos+=wargame3Buffer.length;
                }
            } else {
                var length = slicedBuffer.readUIntBE(0,2); 
                buffers.push(slicedBuffer.slice(0, length+2));
            }
            pos+=(length+2);
        } else {
            buffers.push(slicedBuffer);
            pos+=slicedBuffer.length;
        }
    }
    return buffers;
}
