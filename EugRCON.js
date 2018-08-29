"use strict;"
var exec = require('child_process').exec;

class EugRCON {
  constructor(rconPath, rconRemoteHost, rconRemotePort, rconPassword){
    this.rconPath = rconPath;
    this.rconRemoteHost = rconRemoteHost;
    this.rconRemotePort = rconRemotePort;
    this.rconPassword = rconPassword;
    this.eugTcpProxybtwUserAndDedicated = [];
  }

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

  setpvar(playerid, property, value) {
    // 'setpvar ' + data.playerid + ' ' + data.Property + ' ' + data.value
    this.executeRCON('setpvar ' + playerid + ' ' + property + ' ' + value);
  }

  setsvar(property, value) {
    this.executeRCON('setsvar ' + property + ' ' + value);
  }

  launch() {
    this.executeRCON('launch')
  }

  cancel_launch() {
    this.executeRCON('cancel_launch')
  }

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
              return parseInt(playerid) == context.user.EugNetId;
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
            return parseInt(playerid) == context.user.EugNetId;
        });
        return playerid;
    });
  }

  sendProtocolsFromAllUserToDedicated(eugProtocols) {
    this.sendProtocolsFromUsersToDedicatedIFCondition(eugProtocols, function(context){return true;})
  }
}

module.exports = function(rconPath, rconRemoteHost, rconRemotePort, rconPassword){
  return new EugRCON(rconPath, rconRemoteHost, rconRemotePort, rconPassword);
}