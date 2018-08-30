
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
const ServerConfig = require('../../server-config.json');
const EugPacketStruct = require('../../EugPacketStruct');
const express = require('express');
class ChatNoticeModule{
  constructor(serverState, eugEmitter, eugRCON, importedModules, absolutePath){
    this._enabled = true;
    this._serverState = serverState;
    this._eugEmitter = eugEmitter;
    this._eugRCON = eugRCON;
    this._importedModules = importedModules;
    this._absolutePath = absolutePath;
    this.setProtocolModulars();
    this.moduleInfo = {
      name: "Chat Notice"
    }
  }

  publicRouter(io) {
    const router = require('express').Router();
    this._publicRouter = router;
    router.get('/', (req, res)=>{
      res.send("Chat Notice public get");
    })
    return router;
  }

  adminRouter(io) {
    const router = express.Router();
    const app = express();
    app.set('views', this._absolutePath + "/admin/views");
    app.set('view engine', 'jade');
    this._adminRouter = router;
    router.get('/', (req, res)=>{
      res.render('index');
    })
    app.use('/js', express.static(this._absolutePath + "/admin/js"))
    io.on('connection', (socket)=>{
      socket.on('sendChatTo', (data)=>{
        if(!data.playeridTo || !data.chat){
          return;
        }
        var playeridFrom;
        if(data.playeridFrom){
          playeridFrom = data.playeridFrom;
        } else {
          playeridFrom = ServerConfig.serverAdminEugNetId;
        }
        const chat = data.chat;
        const playeridTo = data.playeridTo;
        const sendMsg = new EugPacketStruct.Wargame3.DedicatedToUser.C2();
        sendMsg.ChatLength = 0;
        sendMsg.CommandCode = 0xC2;
        sendMsg.CommandLen = 0;
        sendMsg.WhoSend = 0;
        sendMsg.EugNetId = parseInt(playeridFrom);
        sendMsg.Type = 0x65;
        sendMsg.Unknown1 = 0x010000;
        sendMsg.Padding = 0;
        sendMsg.Chat = chat;
        eugRCON.sendProtocolsFromDedicatedToUsers(playeridTo, sendMsg);
      })
      socket.on('disconnect',()=>{})
    })
    app.use('/', router);
    return app;
  }

  setProtocolModulars() {
    this._DedicatedToUserProtocols = {
      enabled: true,
    };
    this._UserToDedicatedProtocols = {
      enabled: true,
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
  return new ChatNoticeModule(serverState, eugEmitter, eugRCON, importedModules, absolutePath);
}