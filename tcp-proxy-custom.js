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
                console.log(wargame3Protocol);
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
    var pos = 0;
    var structure = [];
    structure.push({Field:'CommandLen', data:data.readUIntBE(pos,2)}); pos = pos+2;
    structure.push({Field:'CommandCode', data:data.readUIntBE(pos, 1)}); pos = pos+1;
    structure.push({Field:'ServerPort', data:data.readUIntLE(pos, 2)}); pos = pos+2;
    structure.push({Field:'Unknown1', data:data.readUIntBE(pos, 4)}); pos = pos+4;
    structure.push({Field:'ServerIP', data:data.readUIntBE(pos, 4)}); pos = pos+4;
    structure.push({Field:'Unknown2', data:data.readUIntBE(pos, 1)}); pos = pos+4;
    var EugNetIdLen = data.readUIntBE(pos, 4);
    structure.push({Field:'EugNetIdLen', data:data.readUIntBE(pos, 4)}); pos = pos+4;
    structure.push({Field:'EugNetId', data:data.toString('utf8', pos, pos+EugNetIdLen)}); pos = pos+EugNetIdLen;
    var DedicatedKeyLen = data.readUIntBE(pos, 4);
    structure.push({Field:'DedicatedKeyLen', data:data.readUIntBE(pos, 4)}); pos = pos+4;
    structure.push({Field:'DedicatedKey', data:data.toString('utf8', pos, pos+DedicatedKeyLen)}); pos = pos+DedicatedKeyLen;
    return structure;

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
