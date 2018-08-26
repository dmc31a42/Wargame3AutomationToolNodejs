var net = require("net");
var NodeConfig = require('./node-config');
var exec = require('child_process').exec;
const path = require('path');
var fs = require("fs");
const EugPacketStruct = require('./EugPacketStruct');

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

function uniqueKey(socket) {
    var key = socket.remoteAddress + ":" + socket.remotePort;
    return key;
}

class EugTcpProxy {
    constructor(proxyPort, serviceHost, servicePort, options, serverState, proxyToServiceCommandCodes, serviceToProxyCommandCodes) {
        this.proxyPort = proxyPort;
        this.serviceHost = serviceHost;
        this.servicePort = servicePort;
        if (options === undefined) {
            this.options = {
                quiet: false
            };
        }
        else {
            this.options = options;
        }
        this.proxySockets = {};
        this.contexts = {};
        this.serverState = serverState;
        this.proxyToServiceCommandCodes = proxyToServiceCommandCodes;
        this.serviceToProxyCommandCodes = serviceToProxyCommandCodes;
        this.createProxy();
    }
    createProxy() {
        const proxy = this;
        proxy.server = net.createServer(function (proxySocket) {
            var key = uniqueKey(proxySocket);
            proxy.proxySockets[key] = proxySocket;
            var context = {
                buffers: [],
                connected: false,
                proxySocket: proxySocket,
            };
            proxy.contexts[key] = context;
            proxy.createServiceSocket(context);
            proxySocket.on("data", function (data) {
                var buffers = checkWargame3Packet(data, proxy.proxyToServiceCommandCodes, proxy.serverState, context);
                buffers.forEach((element) => {
                    if (context.connected) {
                        context.serviceSocket.write(element);
                    }
                    else {
                        context.buffers[context.buffers.length] = element;
                    }
                    console.log("local >> proxy >> remote : ", element);
                });
            });
            proxySocket.on("close", function (hadError) {
                if (hadError) {
                    console.log(hadError);
                }
                delete proxy.proxySockets[uniqueKey(proxySocket)];
                context.serviceSocket.destroy();
            });
            proxySocket.on("error", function (e) {
                console.log(e);
                context.proxySocket.destroy();
            });
        });
        proxy.server.listen(proxy.proxyPort, proxy.options.hostname);
    }
    createServiceSocket(context) {
        const proxy = this;
        context.serviceSocket = new net.Socket();
        context.serviceSocket.connect(proxy.servicePort, proxy.serviceHost, function () {
            context.connected = true;
            if (context.buffers.length > 0) {
                for (var i = 0; i < context.buffers.length; i++) {
                    context.serviceSocket.write(context.buffers[i]);
                }
            }
        });
        context.serviceSocket.on("data", function (data) {
            var buffers = checkWargame3Packet(data, proxy.serviceToProxyCommandCodes, proxy.serverState, context);
            buffers.forEach((element) => {
                context.proxySocket.write(element);
                console.log("remote >> proxy >> local", element);
            });
        });
        context.serviceSocket.on("close", function (hadError) {
            if (hadError) {
                console.log(hadError);
            }
            clearInterval(context.replayInterval);
            context.proxySocket.destroy();
        });
        context.serviceSocket.on("error", function (e) {
            console.log(e);
            clearInterval(context.replayInterval);
            context.proxySocket.destroy();
        });
        return context;
    }
    SendMessage(receiver, msg, sender) {
        if (!sender) {
            sender = 986359;
        }
        var sendMsg = new EugPacketStruct.Wargame3.UserToDedicated.C2();
        sendMsg.ChatLength = 0;
        sendMsg.CommandCode = 0xC2;
        sendMsg.CommandLen = 0;
        sendMsg.WhoSend = 0;
        sendMsg.EugNetId = sender;
        sendMsg.Type = 0x65;
        sendMsg.Unknown1 = 0x010000;
        sendMsg.Padding = 0;
        sendMsg.receive = false;
        sendMsg.send = true;
        sendMsg.Chat = msg;
        for(var key in this.contexts){
            var context = this.contexts[key];
            if(receiver==0 || context.user.EugNetId == receiver){
                context.proxySocket.write(sendMsg.getBuffer())
            }
        }        
    }
    end() {
        this.server.close();
        for (var key in this.proxySockets) {
            this.proxySockets[key].destroy();
        }
        this.server.unref();
    }
    log(msg) {
        if (!this.options.quiet) {
            console.log(msg);
        }
    }
}

module.exports.createProxy = function(proxyPort,
serviceHost, servicePort, options, serverState, proxyToServiceCommandCodes, serviceToProxyCommandCodes) {
    return new EugTcpProxy(proxyPort, serviceHost, servicePort, options, serverState, proxyToServiceCommandCodes, serviceToProxyCommandCodes);
};

function checkWargame3Packet(data, commandCodes, serverState, context){
    
    var pos = 0;
    var buffers = [];
    while(pos<data.length){
        var slicedBuffer = data.slice(pos);
        if(slicedBuffer.length>=3){
            var index = commandCodes.findIndex(function(element){
                if(slicedBuffer[2] == element.code) return true;
            })
            var length = slicedBuffer.readUIntBE(0,2); 
            if(index>=0){
                var wargame3Protocol = new commandCodes[index].class().FromBuffer(slicedBuffer);
                if(commandCodes[index].preFunction){
                    commandCodes[index].preFunction(wargame3Protocol, serverState, context);
                }
                if(commandCodes[index].modifyFunction){
                    var modifiedProtocols = commandCodes[index].modifyFunction(wargame3Protocol, serverState, context);
                    if(modifiedProtocols){
                        modifiedProtocols.forEach((element)=>{
                            var modifiedBuffer = element.getBuffer();
                            console.log('Wargame3Packet', element);
                            buffers.push(modifiedBuffer);
                        })
                    }
                } else {
                    console.log('Wargame3Packet', wargame3Protocol);
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
    return buffers;
}