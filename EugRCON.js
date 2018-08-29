"use strict;"
var exec = require('child_process').exec;

class EugRCON {
  constructor(rconPath, rconRemoteHost, rconRemotePort, rconPassword){
    this.reconPath = rconPath;
    this.reconRemoteHost = rconRemoteHost;
    this.rconRemotePort = rconRemotePort;
    this.rconPassword = rconPassword;
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

}

module.exports = function(rconPath, rconRemoteHost, rconRemotePort, rconPassword){
  return new EugRCON(rconPath, rconRemoteHost, rconRemotePort, rconPassword);
}