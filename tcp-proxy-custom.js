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
            var wargame3Protocol = checkWargame3Protocol(data);
            if(wargame3Protocol){
                console.log(wargame3Protocol.getBuffer());
            }
            if (context.connected) {
                context.serviceSocket.write(data);
            } else {
                context.buffers[context.buffers.length] = data;
            }
            console.log(key);
            console.log("local >> proxy >> remote1");
            console.log(data);
        });
        proxySocket.on("close", function(hadError) {
            delete proxy.proxySockets[uniqueKey(proxySocket)];
            context.serviceSocket.destroy();
        });
    });
    proxy.server.listen(proxy.proxyPort, proxy.options.hostname);
};

function checkWargame3Protocol(data){
    var commandCode = [{code: 0xe1, callback:wargame3_e1},
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
    class Wargame3_el_Send {
        constructor(data){
            FromBuffer(data);
        }
        FromBuffer(data){
            var pos = 0;
            this.CommandLen = data.readUIntBE(pos,2); pos = pos+2;
            this.CommandCode = data.readUIntBE(pos, 1); pos = pos+1;
            this.ServerPort = data.readUIntLE(pos, 2); pos = pos+2;
            this.Unknown1 = data.readUIntBE(pos, 4); pos = pos+4;
            this.ServerIP = data.readUIntBE(pos, 4); pos = pos+4;
            this.Unknown2 = data.readUIntBE(pos, 1); pos = pos+1;
            var EugNetIdLen = data.readUIntBE(pos, 4);
            this.EugNetIdLen = data.readUIntBE(pos, 4); pos = pos+4;
            this.EugNetId = data.toString('utf8', pos, pos+EugNetIdLen); pos = pos+EugNetIdLen;
            var DedicatedKeyLen = data.readUIntBE(pos, 4);
            this.DedicatedKeyLen = data.readUIntBE(pos, 4); pos = pos+4;
            this.DedicatedKey = data.toString('utf8', pos, pos+DedicatedKeyLen); pos = pos+DedicatedKeyLen;
        }
        getBuffer(){
            if(this.CommandLen){
                var buf = new Buffer(this[0].data);
                var pos = 0;
                buf.writeUIntBE(this[0].data, pos, 2); pos = pos+2; // CommandLen
                buf.writeUIntBE(this[1].data, pos, 1); pos = pos+1; // CommandCode
                buf.readUIntLE(this[2].data, pos, 2); pos = pos+2; // ServerPort
                buf.writeUIntBE(this[3].data, pos, 4); pos = pos+4; // Unknown1
                buf.writeUIntBE(this[4].data, pos, 4); pos = pos+4; // ServerIP
                buf.writeUIntBE(this[5].data, pos, 1); pos = pos+1; // Unknown2
                var EugNetIdLen = this[6].data;
                buf.writeUIntBE(EugNetIdLen, pos, 4); pos = pos+4; // EugNetIdLen
                buf.write(this[7].data, pos, EugNetIdLen, 'utf8'); pos = pos+EugNetIdLen; // EugNetId
                var DedicatedKeyLen = this[8].data;
                buf.writeUIntBE(DedicatedKeyLen, pos, 4); pos = pos+4; // DedicatedKeyLen
                buf.write(this[9].data, pos, DedicatedKeyLen); pos = pos+DedicatedKeyLen; // DedicatedKey
                return buf;
            } else {
                return undefiend;
            }
        }
    }
    return new Wargame3_el_Send(data);

}
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
        context.proxySocket.write(data);
        console.log(proxy.servicePort, proxy.serviceHost);
        console.log("remote >> proxy >> local");
            console.log(data);
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
