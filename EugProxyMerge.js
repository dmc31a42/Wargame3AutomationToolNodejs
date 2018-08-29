"use strict;"
const fs = require('fs');
const EugPacketStruct = require('./EugPacketStruct.js');
var ServerConfig = require('./server-config.json');

const Player = require('./Player');
const ServerState = require('./ServerState');
const eugRCON = require('./EugRCON')(ServerConfig.rconPath, ServerConfig.rconRemoteHost, ServerConfig.rconRemotePort, ServerConfig.rconPassword)
const serverState = new ServerState();
const EventEmitter = require('events');
class EugEmitter extends EventEmitter {}
const eugEmitter = new EugEmitter();


class BtwDedicatedAndEugMainModule{
    constructor(){
        this._enabled = true;
        this.setProtocolModulars();
    }
    setProtocolModulars() {
        this._DedicatedToEugProtocols = {
            enabled: true,
            E1: (protocol, extraProtocols, serverState, context) => {
                protocol.ServerPort = 10810;
                return {
                    protocol: protocol,
                    extraProtocols: extraProtocols
                };
            }
        };
        this._EugToDedicatedProtocols = {
            enabled: true,
        }
    }

    set enabled(value){}
    get enabled() {return this._enabled;}
    
    get ProtocolModulars() {
        return {
            proxyToService: this._DedicatedToEugProtocols,
            serviceToProxy: this._EugToDedicatedProtocols
        }
    }
}

class BtwUserAndDedicatedMainModule{
    constructor(){
        this._enabled = true;
        this.setProtocolModulars();
    }
    setProtocolModulars(){
        this._UserToDedicatedProtocols = {
            enabled: true,
            C1: (protocol, extraProtocols, serverState, context) => {
                const EugNetId = protocol.EugNetId;
                const PlayerName = protocol.PlayerName;

                var EugNetIdKeys = Object.keys(serverState.players);
                if(EugNetIdKeys.indexOf(EugNetId)==-1){
                    var player = new Player();
                    serverState.players[EugNetId] = player;
                }
                context.user = serverState.players[EugNetId];

                context.user.EugNetId = EugNetId;
                context.user.PlayerName = PlayerName;
                var address = context.proxySocket.address();
                context.user.IP = address.address;
                context.user.Port = address.port;
                return {
                    protocol: protocol,
                    extraProtocols: extraProtocols
                };
            }
        }
        this._DedicatedToUserProtocols = {
            enabled: true,
        }
    }

    set enabled(value){}
    get enabled() {return this._enabled;}

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
var moduleFolders = fs.readdirSync("./modules");
moduleFolders.forEach((element)=>{
    var importedModule = require("./modules/" + element)(serverState, eugEmitter, eugRCON, btwUserAndDedicatedModules);
    if(!importedModule.moduleInfo && !(importedModule.moduleInfo.name == element)){
        ////수정해야함
    }
    btwUserAndDedicatedModules.push(importedModule);
})
const UserToDedicatedModulars = [];
const DedicatedToUserModulars = [];
btwUserAndDedicatedModules.forEach((element)=>{
    UserToDedicatedModulars.push(element.ProtocolModulars.proxyToService);
    DedicatedToUserModulars.push(element.ProtocolModulars.serviceToProxy);
})

const EugTcpProxyBtwDedicatedAndEug = require('./EugTcpProxy.js').createProxy(
    ServerConfig.port_mms,
    ServerConfig.ip_mms, 
    ServerConfig.port_mms,
    {}, 
    serverState, 
    EugPacketStruct.Wargame3.DedicatedToEug,
    [btwDedicatedAndEugMainModule.ProtocolModulars.proxyToService],
    EugPacketStruct.Wargame3.EugToDedicated, 
    [btwDedicatedAndEugMainModule.ProtocolModulars.serviceToProxy]);
const EugTcpProxyBtwUserAndDedicated = require('./EugTcpProxy.js').createProxy(
    ServerConfig.game_external_port, 
    "127.0.0.1", 
    ServerConfig.game_local_port,
    {}, 
    serverState, 
    EugPacketStruct.Wargame3.UserToDedicated,
    UserToDedicatedModulars, 
    EugPacketStruct.Wargame3.DedicatedToUser,
    DedicatedToUserModulars);
const EugUdpProxyBtwUserAndDedicated = require('./EugUdpProxy.js').createServer({
    address: '127.0.0.1',
    port: ServerConfig.game_local_port,
    ipv6: false,
    localaddress: '0.0.0.0',
    localport: ServerConfig.game_external_port,
    localipv6: false,
    timeOutTime: 10000
});

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

const EugLogTail = require('./EugLogTail.js')(serverState, eugEmitter);
EugLogTail.watch();

process.on("uncaughtException", function(err) {

});

process.on("SIGINT", function() {
    EugTcpProxyBtwDedicatedAndEug.end();
    EugTcpProxyBtwUserAndDedicated.end();
    EugUdpProxyBtwUserAndDedicated.end();
});