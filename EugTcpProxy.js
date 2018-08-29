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
    constructor(proxyPort, serviceHost, servicePort, options, serverState, proxyToServiceClasses, proxyToServiceModulars, serviceToProxyClasses, serviceToProxyModulars) {
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
        this.proxyToServiceModulars = proxyToServiceModulars;
        this.serviceToProxyModulars = serviceToProxyModulars;
        this.proxyToServiceClasses = proxyToServiceClasses;
        this.serviceToProxyClasses = serviceToProxyClasses;
        this.initializeCommandCodes();
        this.createProxy();
    }

    initializeCommandCodes(){
        var proxyToServiceCommandCodes = {};
        var serviceToProxyCommandCodes = {};
        for(var commandKey in this.proxyToServiceClasses) {
            proxyToServiceCommandCodes[commandKey] = {
                Class: this.proxyToServiceClasses[commandKey]
            }
            proxyToServiceCommandCodes[commandKey].Modulars = [];
            this.proxyToServiceModulars.forEach((proxyToServiceModular)=>{
                if(proxyToServiceModular[commandKey]){
                    proxyToServiceCommandCodes[commandKey].Modulars.push(proxyToServiceModular);
                }
            })
        }
        for(var commandKey in this.serviceToProxyClasses) {
            serviceToProxyCommandCodes[commandKey] = {
                Class: this.serviceToProxyClasses[commandKey]
            }
            serviceToProxyCommandCodes[commandKey].Modulars = [];
            this.serviceToProxyModulars.forEach((serviceToProxyModular)=>{
                if(serviceToProxyModular[commandKey]){
                    serviceToProxyCommandCodes[commandKey].Modulars.push(serviceToProxyModular);
                }
            })
        }
        this.proxyToServiceCommandCodes = proxyToServiceCommandCodes;
        this.serviceToProxyCommandCodes = serviceToProxyCommandCodes;
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

module.exports.createProxy = function(proxyPort, serviceHost, servicePort, options, serverState, proxyToServiceClasses, proxyToServiceModulars, serviceToProxyClasses, serviceToProxyModulars) {
    return new EugTcpProxy(proxyPort, serviceHost, servicePort, options, serverState, proxyToServiceClasses, proxyToServiceModulars, serviceToProxyClasses, serviceToProxyModulars);
};

function checkWargame3Packet(data, commandCodes, serverState, context) {
    var pos = 0;
    var buffers = [];
    while(pos<data.length){
        var slicedBuffer = data.slice(pos);
        if(slicedBuffer.length>=3){
            var commandKey = slicedBuffer[2].toString(16).toUpperCase();
            var commandCode = commandCodes[commandKey];
            var length = slicedBuffer.readUIntBE(0,2); 
            if(commandCode){
                var wargame3Protocol = new commandCodes[commandKey].Class().FromBuffer(slicedBuffer);
                var preProtocol = [];
                var postProtocol = [];
                var modifiedProtocol = wargame3Protocol;
                var extraProtocols = {
                    pre: preProtocol,
                    post: postProtocol
                }
                commandCode.Modulars.forEach((modular)=>{
                    if(modular.enabled){
                        var result = modular[commandKey](modifiedProtocol, extraProtocols, serverState, context);
                        modifiedProtocol = result.protocol;
                        extraProtocols = result.extraProtocols;
                    }
                });
                preProtocol.forEach((element)=>{
                    console.log("preProtocol: ", element);
                    buffers.push(element.getBuffer());
                })
                console.log("Protocol: ", modifiedProtocol);
                buffers.push(modifiedProtocol.getBuffer());
                postProtocol.forEach((element)=>{
                    console.log("postProtocol: ", element);
                    buffers.push(element.getBuffer());
                })
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