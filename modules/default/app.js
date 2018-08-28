
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
  constructor(){
    // this._publicRouterView = true;
    // this._adminRouterView = true;
    this._enabled = true;
    this.createPublicRouter();
    this.createAdminRouter();
    this.setProtocolModulars();
  }

  createPublicRouter() {
    const router = require('express').Router();
    this._publicRouter = router;
    router.get('/', (req, res)=>{
      res.send("default_module public get");
    })

  }

  createAdminRouter() {
    const router = require('express').Router();
    this._adminRouter = router;
    router.get('/', (req, res)=>{
      res.send("defualt_module private get");
    })
  }

  setProtocolModulars() {
    this._DedicatedToUserProtocols = {
      C2: (protocol, extraProtocols, serverState, context) => {
        return {
          protocol: protocol,
          extraProtocols: {
            // pre: ,
            // post: 
          }
        };
      },
      CA: (protocol, extraProtocols, serverState, context) => {
        return {
          protocol: protocol,
          extraProtocols: {
            // pre: ,
            // post: 
          }
        };
      },
      C8: (protocol, extraProtocols, serverState, context) => {
        return {
          protocol: protocol,
          extraProtocols: {
            // pre: ,
            // post: 
          }
        };
      },
      C1: (protocol, extraProtocols, serverState, context) => {
        return {
          protocol: protocol,
          extraProtocols: {
            // pre: ,
            // post: 
          }
        };
      },
    };
    this._UserToDedicatedProtocols = {
      C2: (protocol, extraProtocols, serverState, context) => {
        if(protocol.Type==0x65){
          const DeckRegExp = /^@(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/;
          if(DeckRegExp.exec(protocol.Chat)){
              // executeRCON('setpvar ' + context.user.EugNetId + ' ' + 'PlayerDeckContent ' + protocol.Chat);
          }
        }
        return {
          protocol: protocol,
          extraProtocols: {
            // pre: ,
            // post: 
          }
        };
      },
      C1: (protocol, extraProtocols, serverState, context) => {
        return {
          protocol: protocol,
          extraProtocols: {
            // pre: ,
            // post: 
          }
        };
      },
    };
  }

  set enabled(value) {
    this._enabled = value;
  }
  get enabled() {return this._enabled;}

  get publicRouter() {
    return this._publicRouter;
  }

  get adminRouter() {
    return this._adminRouter;
  }

  get ProtocolModulars() {
    return {
      UserToDedicated: this._UserToDedicatedProtocols,
      DedicatedToUser: this._DedicatedToUserProtocols
    }
  }
}