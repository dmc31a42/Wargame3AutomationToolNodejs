"use strict;"
var exec = require('child_process').exec;

/**@class */
class EugRCON {
    /**
     * 
     * @param {String} rconPath 
     * @param {String} rconRemoteHost 
     * @param {String} rconRemotePort 
     * @param {String} rconPassword 
     */
    constructor(rconPath, rconRemoteHost, rconRemotePort, rconPassword){
        this.rconPath = rconPath;
        this.rconRemoteHost = rconRemoteHost;
        this.rconRemotePort = rconRemotePort;
        this.rconPassword = rconPassword;
        this.eugTcpProxybtwUserAndDedicated = [];
    }

    /**
     * 
     * @access private
     * @param {String} command 
     */
    executeRCON(command) {
        var execution_string = this.rconPath + " -H " 
        + this.rconRemoteHost + ' -P '
        + this.rconRemotePort + " -p '"
        + this.rconPassword + "'" + ' "' 
        + command + '"';

        var child = exec(execution_string, function (error, stdout, stderr) {
        //console.log('stdout: ' + stdout);
        //console.log('stderr: ' + stderr);
        //if (error !== null) {
        //	console.log('exec error: ' + error);
        //}
        });
    }

    /**
     * 
     * @param {String | number} playerid
     * @param {String} property
     * @param {String | number} value
     */
    setpvar(playerid, property, value) {
        // 'setpvar ' + data.playerid + ' ' + data.Property + ' ' + data.value
        this.executeRCON('setpvar ' + playerid + ' ' + property + ' ' + value);
    }

    /**
     * 
     * @param {String} property 
     * @param {String | number} value 
     */
    setsvar(property, value) {
        this.executeRCON('setsvar ' + property + ' ' + value);
    }

    /**
     * 
     * @param {String | number} playerid 
     */
    kick(playerid){
        this.executeRCON('kick ' + playerid);
    }

    /**
     * 
     * @param {String | number} playerid 
     */
    ban(playerid){
        this.executeRCON('ban ' + playerid);
    }

    /**
     * @function
     */
    launch() {
        this.executeRCON('launch')
    }

    /**
     * @function
     */
    cancel_launch() {
        this.executeRCON('cancel_launch')
    }

    /**
     * 
     * @param {String} command 
     */
    command(command) {
        this.executeRCON(command);
    }

    /**
     * 
     * @param {EugProtocol} eugProtocols
     * @param {Function} conditionFunction
     */
    sendProtocolsFromDedicatedToUsersIFCondition(eugProtocols, conditionFunction) {
        var _eugProtocols;
        if(Array.isArray(eugProtocols)) {
            _eugProtocols = eugProtocols;
        } else {
            _eugProtocols = [eugProtocols];
        }
        Object.values(this.eugTcpProxybtwUserAndDedicated[0].contexts).forEach((context)=>{
            if(conditionFunction(context)){
                _eugProtocols.forEach((eugProtocol)=>{
                    context.proxySocket.write(eugProtocol.getBuffer());
                })
                return true;
            }
        });
    }
    sendProtocolsFromDedicatedToUsers(playerids, eugProtocols) {
        var _playerids;
        if(Array.isArray(playerids)) {
            _playerids = playerids;
        } else {
            _playerids = [playerids];
        }
        this.sendProtocolsFromDedicatedToUsersIFCondition(eugProtocols, function(context) {
            var playerid = _playerids.find((playerid)=>{
                    if(context.user) {
                        return context.user.playerid == parseInt(playerid);
                    }
            });
            return playerid;
        });
    }

    sendProtocolsFromDedicatedToAllUser(eugProtocols) {
        sendProtocolsFromDedicatedToUsersIFCondition(eugProtocols, function(context){return true;})
    }

    sendProtocolsFromUsersToDedicatedIFCondition(eugProtocols, conditionFunction) {
        var _eugProtocols;
        if(Array.isArray(eugProtocols)) {
            _eugProtocols = eugProtocols;
        } else {
            _eugProtocols = [eugProtocols];
        }
        Object.values(this.eugTcpProxybtwUserAndDedicated[0].contexts).forEach((context)=>{
            if(conditionFunction(context)){
                _eugProtocols.forEach((eugProtocol)=>{
                    if (context.connected) {
                        context.serviceSocket.write(eugProtocol.getBuffer());
                    }
                    else {
                        context.buffers[context.buffers.length] = eugProtocol.getBuffer();
                    }
                })
                return true;
            }
        });
    }

    sendProtocolsFromUsersToDedicated(playerids, eugProtocols) {
        var _playerids;
        if(Array.isArray(playerids)) {
            _playerids = playerids;
        } else {
            _playerids = [playerids];
        }
        this.sendProtocolsFromUsersToDedicatedIFCondition(eugProtocols, function(context) {
            var playerid = _playerids.find((playerid)=>{
                if(context.user) {
                    return context.user.playerid == parseInt(playerid);
                }
            });
            return playerid;
        });
    }

    sendProtocolsFromAllUserToDedicated(eugProtocols) {
        this.sendProtocolsFromUsersToDedicatedIFCondition(eugProtocols, function(context){return true;})
    }
}

module.exports = EugRCON;