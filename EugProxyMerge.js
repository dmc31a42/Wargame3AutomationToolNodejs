"use strict;"
const fs = require('fs');
const EugPacketStruct = require('./EugPacketStruct');
var ServerConfig = require('./server-config.json');
const EugRCON = require('./EugRCON');
const eugRCON = new EugRCON(ServerConfig.rconPath, ServerConfig.rconRemoteHost, ServerConfig.rconRemotePort, ServerConfig.rconPassword);
const EugPlayer = require('./EugPlayer');
const ServerState = require('./EugServerState');
const serverState = new ServerState();
const EventEmitter = require('events');
/**@class */
class EugEmitter extends EventEmitter {}
const eugEmitter = new EugEmitter();
const BtwProxyAndServiceModule = require('./BtwProxyAndServiceModule')
const EugProtocolModular = require('./EugProtocolModular');
const EugProtocolModifierFunction = require('./EugProtocolModifierFunction')

/**@implements {BtwProxyAndServiceModule} */
class BtwDedicatedAndEugMainModule extends BtwProxyAndServiceModule{
    constructor(){
        super();
        this._enabled = true;
        this.setProtocolModulars();
    }
    setProtocolModulars() {
        /**@type {EugProtocolModular} */
        this._DedicatedToEugProtocols = {
            enabled: true,
            EugProtocolModifierFunctions: {
                /**@type {EugProtocolModifierFunction} */
                E1: (protocol, extraProtocols, serverState, context) => {
                    protocol.ServerPort = 10810;
                    return {
                        protocol: protocol,
                        extraProtocols: extraProtocols
                    };
                }
            }
        };
        /**@type {EugProtocolModular} */
        this._EugToDedicatedProtocols = {
            enabled: true,
            EugProtocolModifierFunctions: {}
        }
    }

    set enabled(value){}
    get enabled() {return this._enabled;}
    /**@returns {{proxyToService: EugProtocolModular, serviceToProxy: EugProtocolModular}} */
    get ProtocolModulars() {
        return {
            proxyToService: this._DedicatedToEugProtocols,
            serviceToProxy: this._EugToDedicatedProtocols
        }
    }
}

/**@implements {BtwProxyAndServiceModule} */
class BtwUserAndDedicatedMainModule extends BtwProxyAndServiceModule{
    constructor(){
        super();
        this._enabled = true;
        this.setProtocolModulars();
    }
    setProtocolModulars(){
        /**@type {EugProtocolModular} */
        this._UserToDedicatedProtocols = {
            enabled: true,
            EugProtocolModifierFunctions: {
                /**@type {EugProtocolModifierFunction} */
                C1: (protocol, extraProtocols, serverState, context) => {
                    const EugNetId = protocol.EugNetId;
    
                    // var EugNetIdKeys = Object.keys(serverState.players);
                    // if(EugNetIdKeys.indexOf(EugNetId)==-1){
                    //     var player = new EugPlayer();
                    //     serverState.players[EugNetId] = player;
                    // }
                    // context.user = serverState.players[EugNetId];
                    context.user = new EugPlayer();
                    context.user.EugNetId = EugNetId;
                    context.user.IP = context.proxySocket.remoteAddress;
                    context.user.Port = context.proxySocket.remotePort;
                    context.user.context = context;
                    return {
                        protocol: protocol,
                        extraProtocols: extraProtocols
                    };
                }
            }
        }
        /**@type {EugProtocolModular} */
        this._DedicatedToUserProtocols = {
            enabled: true,
            EugProtocolModifierFunctions: {}
        }
    }

    set enabled(value){}
    get enabled() {return this._enabled;}
    /**@returns {{proxyToService: EugProtocolModular, serviceToProxy: EugProtocolModular}} */
    get ProtocolModulars() {
        return {
            proxyToService: this._UserToDedicatedProtocols,
            serviceToProxy: this._DedicatedToUserProtocols
        };
    }
}

const btwDedicatedAndEugMainModule = new BtwDedicatedAndEugMainModule();
const btwUserAndDedicatedMainModule = new BtwUserAndDedicatedMainModule();

const btwUserAndDedicatedModules = [btwUserAndDedicatedMainModule];
/**@type {BtwProxyAndServiceModule[]} */
const importedModules = require('./modules')(serverState, eugEmitter, eugRCON, btwUserAndDedicatedModules);
importedModules.forEach((importedModule)=>{
    btwUserAndDedicatedModules.push(importedModule);
})
const UserToDedicatedModulars = [];
const DedicatedToUserModulars = [];
btwUserAndDedicatedModules.forEach((element)=>{
    UserToDedicatedModulars.push(element.ProtocolModulars.proxyToService);
    DedicatedToUserModulars.push(element.ProtocolModulars.serviceToProxy);
})

const EugTcpProxy = require('./EugTcpProxy.js');

const eugTcpProxyBtwDedicatedAndEug = EugTcpProxy.createProxy(
    ServerConfig.port_mms,
    ServerConfig.ip_mms, 
    ServerConfig.port_mms,
    {}, 
    serverState, 
    EugPacketStruct.Wargame3.DedicatedToEug,
    [btwDedicatedAndEugMainModule.ProtocolModulars.proxyToService],
    EugPacketStruct.Wargame3.EugToDedicated, 
    [btwDedicatedAndEugMainModule.ProtocolModulars.serviceToProxy]);
const eugTcpProxyBtwUserAndDedicated = EugTcpProxy.createProxy(
    ServerConfig.game_external_port, 
    "127.0.0.1", 
    ServerConfig.game_local_port,
    {}, 
    serverState, 
    EugPacketStruct.Wargame3.UserToDedicated,
    UserToDedicatedModulars, 
    EugPacketStruct.Wargame3.DedicatedToUser,
    DedicatedToUserModulars);
eugRCON.eugTcpProxybtwUserAndDedicated.push(eugTcpProxyBtwUserAndDedicated);
const eugUdpProxyBtwUserAndDedicated = require('./EugUdpProxy.js').createServer({
    address: '127.0.0.1',
    port: ServerConfig.game_local_port,
    ipv6: false,
    localaddress: '0.0.0.0',
    localport: ServerConfig.game_external_port,
    localipv6: false,
    timeOutTime: 10000
});

const eugWeb = require('./EugWeb')(ServerConfig.ServicePort, serverState, eugEmitter, eugRCON, importedModules);

// TEST TEST TEST
eugEmitter.on("playerChanged", (playerid)=>{
    console.log("playerChanged", serverState.players[playerid]);
})
eugEmitter.on("playerDeleted", (playerid)=>{
    console.log("playerDeleted", playerid);
})
eugEmitter.on("serverStateChanged", ()=>{
    console.log("serverStateChanged", serverState);
})
// eugEmitter.on("serverGameStateChanged", (GameState)=>{
//     console.log("serverGameStateChanged", ServerState.Enum.GameState.toString(GameState));
// })
eugEmitter.on("serverPropertyChanged", (key, value)=>{
    console.log("serverPropertyChanged", key + "->" + value);
})
//

const eugLogTail = require('./EugLogTail.js')(serverState, eugEmitter, eugTcpProxyBtwUserAndDedicated);
eugLogTail.watch();

process.on("uncaughtException", function(err) {

});

process.on("SIGINT", function() {
    eugTcpProxyBtwDedicatedAndEug.end();
    eugTcpProxyBtwUserAndDedicated.end();
    eugUdpProxyBtwUserAndDedicated.end();
    eugLogTail.unwatch();
});