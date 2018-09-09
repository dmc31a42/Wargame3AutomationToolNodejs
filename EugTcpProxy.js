var net = require("net");
const EugPacketStruct = require('./EugPacketStruct');
const EugServerState = require('./EugServerState')
const EugProtocolModular = require('./EugProtocolModular')
const SocketContext = require('./SocketContext')
const Server = net.Server
function uniqueKey(socket) {
    var key = socket.remoteAddress + ":" + socket.remotePort;
    return key;
}

/**@class */
class EugTcpProxy {
    /**
     * 
     * @param {number} proxyPort 
     * @param {String} serviceHost 
     * @param {number} servicePort 
     * @param {*} options 
     * @param {EugServerState} serverState 
     * @param {Object.<string, EugProtocol>} proxyToServiceClasses 
     * @param {EugProtocolModular[]} proxyToServiceModulars 
     * @param {Object.<string, EugProtocol>} serviceToProxyClasses 
     * @param {EugProtocolModular[]} serviceToProxyModulars 
     */
    constructor(proxyPort, serviceHost, servicePort, options, serverState, proxyToServiceClasses, proxyToServiceModulars, serviceToProxyClasses, serviceToProxyModulars) {
        /**@type {number} */
        this.proxyPort = proxyPort;
        /**@type {String} */
        this.serviceHost = serviceHost;
        /**@type {number} */
        this.servicePort = servicePort;
        if (options === undefined) {
            /**
             * 이 옵션은 TcpProxy의 원본을 가지고 확인해봐야함.
             * @type {Object}
             */
            this.options = {
                quiet: false
            };
        }
        else {
            this.options = options;
        }
        /**@type {Object.<String, Socket>} */
        this.proxySockets = {};
        /**@type {Object.<string, SocketContext>}*/
        // https://github.com/Microsoft/TypeScript/issues/26573
        // https://github.com/Microsoft/vscode/issues/56884
        this.contexts = {};
        /**@type {EugServerState}*/
        this.serverState = serverState;
        /**@type {EugProtocolModular[]} */
        this.proxyToServiceModulars = proxyToServiceModulars;
        /**@type {EugProtocolModular[]} */
        this.serviceToProxyModulars = serviceToProxyModulars;
        /**@type {Object.<string, EugProtocol>}*/
        this.proxyToServiceClasses = proxyToServiceClasses;
        /**@type {Object.<string, EugProtocol>}*/
        this.serviceToProxyClasses = serviceToProxyClasses;
        this.initializeCommandCodes();
        this.createProxy();
        /**
         * @type {Server}
         */
        this.server;
    }

    /**
     * @access private
     */
    initializeCommandCodes(){
        /**
         * @typedef BtwProxyAndServiceCommandCode
         * @property {EugProtocol} Class
         * @property {EugProtocolModular[]} Modulars
         */
        /**@type {Object.<String, BtwProxyAndServiceCommandCode>} */
        var proxyToServiceCommandCodes = new Object();
        /**@type {Object.<String, BtwProxyAndServiceCommandCode>} */
        var serviceToProxyCommandCodes = new Object();
        for(var commandKey in this.proxyToServiceClasses) {
            proxyToServiceCommandCodes[commandKey] = {
                Class: this.proxyToServiceClasses[commandKey]
            }
            proxyToServiceCommandCodes[commandKey].Modulars = [];
            this.proxyToServiceModulars.forEach((proxyToServiceModular)=>{
                if(proxyToServiceModular.EugProtocolModifierFunctions !== undefined && 
                    "function" === typeof proxyToServiceModular.EugProtocolModifierFunctions[commandKey]){
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
                if(serviceToProxyModular.EugProtocolModifierFunctions !== undefined &&
                    "function" === typeof serviceToProxyModular.EugProtocolModifierFunctions[commandKey]){
                    serviceToProxyCommandCodes[commandKey].Modulars.push(serviceToProxyModular);
                }
            })
        }
        this.proxyToServiceCommandCodes = proxyToServiceCommandCodes;
        this.serviceToProxyCommandCodes = serviceToProxyCommandCodes;
    }
    /**
     * @access private
     */
    createProxy() {
        /**@type {EugTcpProxy} */
        const proxy = this;
        proxy.server = net.createServer(function (proxySocket) {
            var key = uniqueKey(proxySocket);
            proxy.proxySockets[key] = proxySocket;
            
            /**@type {SocketContext} */
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
                    //console.log("local >> proxy >> remote : ", element);
                });
            });
            proxySocket.on("close", function (hadError) {
                if (hadError) {
                    console.log(hadError);
                }
                delete proxy.proxySockets[uniqueKey(proxySocket)];
                context.serviceSocket.destroy();
                try{
                    if(context.user && context.user._connectCorrectly == false)
                    {
                       delete context.user; 
                    }
                    
                } catch(e){
                    console.log(e);
                }               
                //delete proxy.contexts[uniqueKey(proxySocket)]
            });
            proxySocket.on("error", function (e) {
                console.log(e);
                context.proxySocket.destroy();
                try{
                    if(context.user && context.user._connectCorrectly == false)
                    {
                       delete context.user; 
                    }
                    
                } catch(e){
                    console.log(e);
                }                
                //delete proxy.contexts[uniqueKey(proxySocket)]
            });
        });
        proxy.server.listen(proxy.proxyPort, proxy.options.hostname);
    }
    /**
     * @access private
     * @param {SocketContext} context 
     */
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
                //console.log("remote >> proxy >> local", element);
            });
        });
        context.serviceSocket.on("close", function (hadError) {
            if (hadError) {
                console.log(hadError);
            }
            clearInterval(context.replayInterval);
            context.proxySocket.destroy();
            try{
                if(context.user && context.user._connectCorrectly == false)
                {
                   delete context.user; 
                }
                
            } catch(e){
                console.log(e);
            }               
            //delete proxy.contexts[uniqueKey(proxySocket)]
        });
        context.serviceSocket.on("error", function (e) {
            console.log(e);
            clearInterval(context.replayInterval);
            context.proxySocket.destroy();
            try{
                if(context.user && context.user._connectCorrectly == false)
                {
                   delete context.user; 
                }
                
            } catch(e){
                console.log(e);
            }        
            //delete proxy.contexts[uniqueKey(proxySocket)]
        });
        return context;
    }
    /**
     * 
     * @param {number} receiver - 채팅 메세지를 받을 PlayerUserId
     * @param {String} msg - 채팅 메세지의 내용
     * @param {number} sender  - 채팅 메세지를 보낸 것으로 표시할 PlayerUserId
     */
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
    /**
     * 이 EugTcpProxy를 종료함
     */
    end() {
        this.server.close();
        for (var key in this.proxySockets) {
            this.proxySockets[key].destroy();
        }
        this.server.unref();
    }
    /**
     * @access private
     * @param {Buffer} msg 
     */
    log(msg) {
        if (!this.options.quiet) {
            //console.log(msg);
        }
    }

    /**
     * 
     * @param {number} proxyPort 
     * @param {String} serviceHost 
     * @param {number} servicePort 
     * @param {*} options 
     * @param {EugServerState} serverState 
     * @param {Object.<string, EugProtocol>} proxyToServiceClasses 
     * @param {EugProtocolModular[]} proxyToServiceModulars 
     * @param {Object.<string, EugProtocol>} serviceToProxyClasses 
     * @param {EugProtocolModular[]} serviceToProxyModulars 
     */
    static createProxy(proxyPort, serviceHost, servicePort, options, serverState, proxyToServiceClasses, proxyToServiceModulars, serviceToProxyClasses, serviceToProxyModulars) {
        return new this(proxyPort, serviceHost, servicePort, options, serverState, proxyToServiceClasses, proxyToServiceModulars, serviceToProxyClasses, serviceToProxyModulars);    
    }
}

module.exports = EugTcpProxy;

/**
 * @memberof EugTcpProxy.checkWargame3Packet
 * @access private
 * @param {Buffer} data 
 * @param {Object.<String, BtwProxyAndServiceCommandCode>} commandCodes 
 * @param {EugServerState} serverState 
 * @param {SocketContext} context 
 */
function checkWargame3Packet(data, commandCodes, serverState, context) {
    var pos = 0;
    var buffers = [];
    while(pos<data.length){
        var slicedBuffer = data.slice(pos);
        if(slicedBuffer.length>=3){
            var commandKey = slicedBuffer[2].toString(16).toUpperCase();
            /**@type {BtwProxyAndServiceCommandCode} */
            var commandCode = commandCodes[commandKey];
            var length = slicedBuffer.readUIntBE(0,2); 
            if(commandCode){
                /**@type {EugProtocol} */
                var wargame3Protocol = new commandCodes[commandKey].Class().FromBuffer(slicedBuffer);
                /**@type {EugProtocol[]} */
                var preProtocol = [];
                /**@type {EugProtocol[]} */
                var postProtocol = [];
                /**@type {EugProtocol} */
                var modifiedProtocol = wargame3Protocol;
                var extraProtocols = {
                    pre: preProtocol,
                    post: postProtocol
                }
                /**
                 * @param {EugProtocolModular} modular
                 */
                commandCode.Modulars.forEach((modular)=>{
                    if(modular.enabled){
                        var result = modular.EugProtocolModifierFunctions[commandKey](modifiedProtocol, extraProtocols, serverState, context);
                        modifiedProtocol = result.protocol;
                        extraProtocols = result.extraProtocols;
                    }
                });
                preProtocol.forEach((element)=>{
                    //console.log("preProtocol: ", element);
                    buffers.push(element.getBuffer());
                })
                //console.log("Protocol: ", modifiedProtocol);
                buffers.push(modifiedProtocol.getBuffer());
                postProtocol.forEach((element)=>{
                    //console.log("postProtocol: ", element);
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