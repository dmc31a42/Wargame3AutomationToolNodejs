"use strict;"
const EugPacketStruct = require('./EugPacketStruct.js');
var ServerConfig = require('./server-config.json');
var exec = require('child_process').exec;
const Player = require('./Player');
const ServerState = require('./ServerState');

const serverState = new ServerState();

function executeRCON(command) {
    var execution_string = ServerConfig.rconPath + " -H " 
        + ServerConfig.rconRemoteHost + ' -P '
        + ServerConfig.rconRemotePort + " -p '"
        + ServerConfig.rconPassword + "'" + ' "' 
        + command + '"';
	
	var child = exec(execution_string, function (error, stdout, stderr) {
		//console.log('stdout: ' + stdout);
		//console.log('stderr: ' + stderr);
		//if (error !== null) {
		//	console.log('exec error: ' + error);
		//}
	});
}

const EugToDedicatedCommandCodes = [
    {code: 0xE1, class: EugPacketStruct.Wargame3.EugToDedicated.E1},
];
const DedicatedToEugCommandCodes = [
    {code: 0xE1, class: EugPacketStruct.Wargame3.DedicatedToEug.E1, modifyFunction:function(protocol, serverState, context){
        protocol.ServerPort = 10810
        return [protocol];
    }},
];

var DedicatedToUserCommandCodes = [
    {code: 0xC2, class: EugPacketStruct.Wargame3.DedicatedToUser.C2},
    {code: 0xCA, class: EugPacketStruct.Wargame3.DedicatedToUser.CA, 
        preFunction: function(protocol, serverState, context){
            context.user[protocol.Property] = protocol.Value;
        }
        // modifyFunction:function(protocol, serverState, context){
        //     if(context.user.EugNetId == 986359 && protocol.Property == "PlayerObserver") {
        //         protocol.Value = "1";
        //         return [protocol];
        //     } else {
        //         return [protocol];
        //     }
        // }
    },
    {code: 0xC8, class: EugPacketStruct.Wargame3.DedicatedToUser.C8, preFunction:function(protocol, serverState, context){       
        if(protocol.UnknownMod==0){
            context.user.PlayerNumber = protocol.PlayerNumber;
        }
    }},
    {code: 0xC1, class: EugPacketStruct.Wargame3.DedicatedToUser.C1,
        // modifyFunction:function(protocol, serverState, context){
        //     if(context.user.EugNetId == 986359){
        //         context.blockFromServer = true;
        //         protocol.UserSessionId = 0xffffffff;
        //         protocol.Unknown1 = 0x35;
        //         protocol.ClientObsMod = 0x35;              
        //         return [protocol];
        //     } else {
        //         return [protocol];
        //     }
        // }
    }    
];

var UserToDedicatedCommandCodes = [
    {code: 0xC2, class: EugPacketStruct.Wargame3.UserToDedicated.C2, preFunction:function(protocol, serverState, context){
        if(protocol.Type==0x65){
            const DeckRegExp = /^@(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/;
            if(DeckRegExp.exec(protocol.Chat)){
                executeRCON('setpvar ' + context.user.EugNetId + ' ' + 'PlayerDeckContent ' + protocol.Chat);
            }
        }            
    }}, // Player->Proxy->Dedicated
    {code: 0xC1, class: EugPacketStruct.Wargame3.UserToDedicated.C1, preFunction:function(protocol, serverState, context){
        const EugNetId = protocol.EugNetId;
        const PlayerName = protocol.PlayerName;

        var EugNetIdKeys = Object.keys(serverState.players);
        if(EugNetIdKeys.indexOf(EugNetId)>-1){
            context.user = serverState.players[EugNetId];
        } else {
            var player = new Player();
            context.user = player;
            serverState.players[EugNetId] = player;
        }
        context.user.EugNetId = EugNetId;
        context.user.PlayerName = PlayerName;
        var address = context.proxySocket.address();
        context.user.IP = address.address;
        context.user.Port = address.port;
    },
        // modifyFunction:function(protocol, serverState, context){
        //     if(protocol.EugNetId == 986359){
        //         //protocol.Unknown3 = 2;
        //     }
        //     return [protocol];
        // }
    } // Player->Proxy->Dedicated
];

const EugTcpProxyBtwDedicatedAndEug = require('./EugTcpProxy.js').createProxy(
    ServerConfig.port_mms,
    ServerConfig.ip_mms, 
    ServerConfig.port_mms,
    {}, 
    serverState, 
    DedicatedToEugCommandCodes, 
    EugToDedicatedCommandCodes);
const EugTcpProxyBtwUserAndDedicated = require('./EugTcpProxy.js').createProxy(
    ServerConfig.game_external_port, 
    "127.0.0.1", 
    ServerConfig.game_local_port,
    {}, 
    serverState, 
    UserToDedicatedCommandCodes, 
    DedicatedToUserCommandCodes);
const EugUdpProxyBtwUserAndDedicated = require('./EugUdpProxy.js').createServer({
    address: '127.0.0.1',
    port: ServerConfig.game_local_port,
    ipv6: false,
    localaddress: '0.0.0.0',
    localport: ServerConfig.game_external_port,
    localipv6: false,
    timeOutTime: 10000
});

process.on("uncaughtException", function(err) {

});

process.on("SIGINT", function() {
    EugTcpProxyBtwDedicatedAndEug.end();
    EugTcpProxyBtwUserAndDedicated.end();
    EugUdpProxyBtwUserAndDedicated.end();
});