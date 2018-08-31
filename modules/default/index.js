const express = require('express');
// class ProtocolModular {
//   constructor(code, preFunction, modifyFunction){
//     this._code = code;
//     this._preFunction = preFunction;
//     tihs._modifyFunction = modifyFunction;
//   }
  
//   get code() {return this._code;}
//   get preFunction() {return this._preFunction;}
//   get modifyFunction() {return this._modifyFunction;}
// }

class DefaultModule{
  constructor(serverState, eugEmitter, eugRCON, importedModules, absolutePath){
    // this._publicRouterView = true;
    // this._adminRouterView = true;
    this._enabled = true;
    this._serverState = serverState;
    this._eugEmitter = eugEmitter;
    this._eugRCON = eugRCON;
    this._importedModules = importedModules;
    this._absolutePath = absolutePath;
    this.setProtocolModulars();
    this.moduleInfo = {
      name: "Default Setting"
    }
  }

  publicRouter(io) {
    const router = express.Router();
    this._publicRouter = router;
    router.get('/*', express.static(this._absolutePath + "/public"));
    return router;
  }

  adminRouter(io) {
    const router = express.Router();
    this._adminRouter = router;
    router.get('/*', express.static(this._absolutePath + "/admin"));
    return router;
  }

  setProtocolModulars() {
    this._DedicatedToUserProtocols = {
      enabled: true,
    };
    this._UserToDedicatedProtocols = {
      enabled: true,
      C2: (protocol, extraProtocols, serverState, context) => {
        if(protocol.Type==0x65){
          const DeckRegExp = /^@(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/;
          if(DeckRegExp.exec(protocol.Chat)){
              this._eugRCON.setpvar(context.user.EugNetId, 'PlayerDeckContent', protocol.Chat)
          }
        }
        return {
          protocol: protocol,
          extraProtocols: extraProtocols
        };
      }
    };
  }

  close(){
    return true;
  }

  set enabled(value) {
    this._enabled = value;
    this._DedicatedToUserProtocols.enabled = value;
    this._UserToDedicatedProtocols.enabled = value;
  }
  get enabled() {return this._enabled;}

  get ProtocolModulars() {
    return {
      proxyToService: this._UserToDedicatedProtocols,
      serviceToProxy: this._DedicatedToUserProtocols
    }
  }
}

module.exports = function(serverState, eugEmitter, eugRCON, importedModules, absolutePath) {
  return new DefaultModule(serverState, eugEmitter, eugRCON, importedModules, absolutePath);
}