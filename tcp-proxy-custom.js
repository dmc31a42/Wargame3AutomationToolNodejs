var net = require("net");

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
            proxySocket: proxySocket
        };    
        proxy.createServiceSocket(context);
        proxySocket.on("data", function(data) {
            if (context.connected) {
                context.serviceSocket.write(data);
            } else {
                context.buffers[context.buffers.length] = data;
            }
            console.log(key);
            console.log("local >> proxy >> remote");
            console.log(data);
            var wargame3Protocol = checkWargame3Protocol(data);
            if(wargame3Protocol){
                if(wargame3Protocol.CommandCode == 0xE1){
                    wargame3Protocol.ServerPort = 10810;
                // } else if(wargame3Protocol.CommandCode == 0xC2) {
                //     wargame3Protocol.Chat = wargame3Protocol.Chat + '라고 말했다 메롱';
                }
                var wargame3ProtocolBuffer = new Uint8Array(wargame3Protocol.getBuffer());
                // if (context.connected) {
                //     context.serviceSocket.write(wargame3ProtocolBuffer);
                // } else {
                //     context.buffers[context.buffers.length] = wargame3ProtocolBuffer;
                // }
                //console.log("local >> proxy >> remote1 : Wargame3Protocol");
                //console.log(wargame3ProtocolBuffer);
            }  else {
                
            }
        });
        proxySocket.on("close", function(hadError) {
            delete proxy.proxySockets[uniqueKey(proxySocket)];
            context.serviceSocket.destroy();
        });
    });
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
        
        var wargame3Protocol = checkWargame3Protocol(data);
        if(wargame3Protocol){
            if(wargame3Protocol.CommandCode == 0xE1){
                wargame3Protocol.ServerPort = 10810;
            } else if(wargame3Protocol.CommandCode == 0xC2) {
                wargame3Protocol.Chat = wargame3Protocol.Chat + '라고 말했다 메롱2';
            }
            var wargame3ProtocolBuffer = new Uint8Array(wargame3Protocol.getBuffer());
            console.log(wargame3ProtocolBuffer);
            context.proxySocket.write(wargame3ProtocolBuffer);
        } else {
            context.proxySocket.write(data);
            console.log("remote >> proxy >> local");
            console.log(data);
        }
    });
    context.serviceSocket.on("close", function(hadError) {
        context.proxySocket.destroy();
    });
    context.serviceSocket.on("error", function(e) {
        context.proxySocket.destroy();
    });
    return context;
}

TcpProxy.prototype.end = function() {
    this.server.close();
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

function checkWargame3Protocol(data){
    var commandCode = [
        {code: 0xe1, callback:wargame3_e1},
        {code: 0xC2, callback:wargame3_C2}
    ];
    if(data.length>=3){
        var index = commandCode.findIndex(function(element){
            if(data[2] == element.code) return true;
        })
        if(index>=0){
            return commandCode[index].callback(data);
        }
    } else {
        return undefiend;
    }
}
function wargame3_e1(data){
    class Wargame3_e1_Send {
        constructor(data){
            this.FromBuffer(data);
        }
        FromBuffer(data){
            var pos = 0;
            this.send = true;
            this.receive = false;
            this.CommandLen = data.readUIntBE(pos,2); pos = pos+2;
            this.CommandCode = data.readUIntBE(pos, 1); pos = pos+1;
            this.ServerPort = data.readUIntLE(pos, 2); pos = pos+2;
            this.Unknown1 = data.readUIntBE(pos, 4); pos = pos+4;
            this.ServerIP = data.readUIntBE(pos, 4); pos = pos+4;
            this.Unknown2 = data.readUIntBE(pos, 1); pos = pos+1;
            this.EugNetIdLen = data.readUIntBE(pos, 4); pos = pos+4;
            this.EugNetId = data.toString('utf8', pos, pos+this.EugNetIdLen); pos = pos+this.EugNetIdLen;
            this.DedicatedKeyLen = data.readUIntBE(pos, 4); pos = pos+4;
            this.DedicatedKey = data.toString('utf8', pos, pos+this.DedicatedKeyLen); pos = pos+this.DedicatedKeyLen;
        }
        getBuffer(){
            if(this.CommandLen){
                var buf = new Buffer(this.CommandLen+2);
                var pos = 0;
                buf.writeUIntBE(this.CommandLen, pos, 2); pos = pos+2; // CommandLen
                buf.writeUIntBE(this.CommandCode, pos, 1); pos = pos+1; // CommandCode
                buf.writeUIntLE(this.ServerPort, pos, 2); pos = pos+2; // ServerPort
                buf.writeUIntBE(this.Unknown1, pos, 4); pos = pos+4; // Unknown1
                buf.writeUIntBE(this.ServerIP, pos, 4); pos = pos+4; // ServerIP
                buf.writeUIntBE(this.Unknown2, pos, 1); pos = pos+1; // Unknown2
                buf.writeUIntBE(this.EugNetIdLen, pos, 4); pos = pos+4; // EugNetIdLen
                buf.write(this.EugNetId, pos, this.EugNetIdLen, 'utf8'); pos = pos+this.EugNetIdLen; // EugNetId
                buf.writeUIntBE(this.DedicatedKeyLen, pos, 4); pos = pos+4; // DedicatedKeyLen
                buf.write(this.DedicatedKey, pos, this.DedicatedKeyLen); pos = pos+this.DedicatedKeyLen; // DedicatedKey
                return buf;
            } else {
                return undefiend;
            }
        }
    }
    return new Wargame3_e1_Send(data);
}

function wargame3_C2(data){
    class Wargame3_C2 {
        constructor(data){
            this.FromBuffer(data);
        }
        FromBuffer(data){
            this.data = data;
            var pos = 0;
            this.send = false;
            this.receive = true;
            this.CommandLen = data.readUIntBE(pos,2); pos = pos+2;
            this.CommandCode = data.readUIntBE(pos, 1); pos = pos+1;
            this.WhoSend = data.readUIntBE(pos, 4); pos+=4;
            if(this.WhoSend == 0){
                this.EugNetId = data.readUIntBE(pos,4); pos+=4;
                this.send = true;
                this.receive = false;
            }
            this.Unknown1 = data.readUIntBE(pos, 4); pos = pos+4;
            this.ChatLength = data.readUIntBE(pos, 2); pos+=2;
            this.Padding = data.readUIntBE(pos, 1); pos+=1;
            this.Chat = data.toString('utf8', pos, pos+this.ChatLength); pos+=this.ChatLength;
        }
        getBuffer(){
            if(this.CommandLen){
                var chatBuffer = Buffer.from(this.Chat);
                var length = this.WhoSend == 0 ? 17+chatBuffer.length+1 : 14+chatBuffer.length+1;
                var buf = new Buffer(length);
                var pos = 0;
                buf.writeUIntBE(length-2, pos, 2); pos = pos+2; // CommandLen
                buf.writeUIntBE(this.CommandCode, pos, 1); pos = pos+1; // CommandCode
                buf.writeUIntBE(this.WhoSend, pos, 4); pos+=4;
                if(this.WhoSend==0){
                    buf.writeUIntBE(this.EugNetId, pos, 4); pos+=4;
                }
                buf.writeUIntBE(this.Unknown1, pos, 4); pos+=4;
                buf.writeUIntBE(chatBuffer.length, pos, 2); pos+=2;
                buf.writeUIntBE(this.Padding, pos, 1); pos+=1;
                chatBuffer.copy(buf, pos); pos+=chatBuffer.length;
                return buf;
            } else {
                return undefiend;
            }
        }
    }
    return new Wargame3_C2(data);
}