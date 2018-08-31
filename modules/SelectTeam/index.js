const express = require('express');
const EugPlayer = require('../../EugPlayer');
const EventEmitter = require('events');
const ServerConfig = require('../../server-config.json');
const EugPacketStruct = require('../../EugPacketStruct');
class SelectTeamEmitter extends EventEmitter{}

class SelectTeamModule{
  constructor(serverState, eugEmitter, eugRCON, importedModules, absolutePath){
    // this._publicRouterView = true;
    // this._adminRouterView = true;
    this._enabled = true;
    this._serverState = serverState;
    this._eugEmitter = eugEmitter;
    this._eugRCON = eugRCON;
    this._importedModules = importedModules;
    this._absolutePath = absolutePath;
    this._NotSelected = [];
    this._Team1Selected = [];
    this._Team2Selected = [];
    this._Team1Code = "blue";
    this._Team2Code = "red";
    this._immediately = false;
    this._whoisTurn = 0;
    this.setProtocolModulars();
    this._moduleEmitter = new SelectTeamEmitter();
    this.moduleInfo = {
      name: "Select Team Automatically"
    }

    this._moduleEmitter.on("teamChanged", ()=>{
      var i=0;
      var team1Done = false;
      var team2Done = false;
      if(this._immediately || this._NotSelected.length == 0){
        while(!team1Done && !team2Done){
          if(this._Team1Selected.length>i){
            eugRCON.setpvar(this._Team1Selected[i], "PlayerAlliance", EugPlayer.Enum.Side.Bluefor); 
          } else {
            team1Done = true;
          }
          if(this._Team2Selected.length>i){
            eugRCON.setpvar(this._Team2Selected[i], "PlayerAlliance", EugPlayer.Enum.Side.Redfor);
          } else {
            team2Done = true;
          }
          i++;
        }
      }
    });

    eugEmitter.on("playerSideChanged", (playerid, side)=>{
      if(this._Team1Selected.indexOf(playerid)>-1 && serverState.players[playerid].side != EugPlayer.Enum.Side.Bluefor) {
        eugRCON.setpvar(playerid, "PlayerAlliance", EugPlayer.Enum.Side.Bluefor);
      } else if(this._Team2Selected.indexOf(playerid)>-1 && serverState.players[playerid].side != EugPlayer.Enum.Side.Redfor){
        eugRCON.setpvar(playerid, "PlayerAlliance", EugPlayer.Enum.Side.Redfor);
      }
    });

    eugEmitter.on("playerConnected", (playerid)=>{
      this._NotSelected.push(playerid);
    })
    eugEmitter.on("playerDeleted", (playerid)=>{
      if(this._NotSelected.indexOf(playerid)>-1){
        this._NotSelected.splice(this._NotSelected.indexOf(playerid),1);
      } else if(this._Team1Selected.indexOf(playerid)>-1){
        this._Team1Selected.splice(this._Team1Selected.indexOf(playerid),1);
      } else if(this._Team2Selected.indexOf(playerid)>-1){
        this._Team2Selected.splice(this._Team2Selected.indexOf(playerid),1);
      } else {
        console.log("SelectTeamModule", playerid + " is not in notselected and teams");
      }
    })
  }

  publicRouter(io) {
    const selectTeamModule = this;
    const router = express.Router();
    this._publicRouter = router;
    const app = express();
    app.use("/", express.static(selectTeamModule._absolutePath+"/public", {
      index: false
    }))
    // 아래 라우터 지우고 위에 index 부분을 true 또는 지우면 똑같이 작동함
    router.get('/', (req, res)=>{
      var selectTeamModule = this;
      res.sendFile(selectTeamModule._absolutePath+"/public/index.html"); 
    })
    io.on('connection', (socket)=>{
      selectTeamModule._moduleEmitter.on("infoChanged",()=>{
        io.emit("infoChanged",{
          notSelected: selectTeamModule._NotSelected,
          team1Selected: selectTeamModule._Team1Selected,
          team2Selected: selectTeamModule._Team2Selected,
          whoisTurn: selectTeamModule._whoisTurn,
        })
      });
      socket.on("getyourTurn",(data)=>{
        switch(data.code){
          case selectTeamModule._Team1Code:
            socket.targetTeam = selectTeamModule._Team1Selected;
            socket.yourTurn = 0;
            break;
          case selectTeamModule._Team2Code:
          socket.targetTeam = selectTeamModule._Team2Selected;
            socket.yourTurn = 1;
            break;
        }
        if(socket.yourTurn) {
          socket.emit("getyourTurn", {
            yourTurn: socket.yourTurn
          })
        } else {
          socket.emit("getyourTurn", {
            response: -1,
            error: "Not authorized"
          })
        }
      })
      socket.on("infoChanged",()=>{
        selectTeamModule._moduleEmitter.emit("infoChanged");
      })
      socket.on("selectPlayer", (data)=>{
        var playerid = data.playerid;
        var response;
        if(selectTeamModule._whoisTurn != socket.yourTurn) {
          response = {
            response: -1,
            error: "It is not your turn"
          }
        } else if(selectTeamModule._NotSelected.indexOf(playerid)==-1) {
          response = {
            response: -1,
            error: "Player is already selected: " + playerid
          }
        } else {
          selectTeamModule._NotSelected.splice(selectTeamModule._NotSelected.indexOf(playerid),-1);
          socket.targetTeam.push(playerid);
          if(selectTeamModule._whoisTurn == 0) {
            selectTeamModule._whoisTurn = 1;
          } else {
            selectTeamModule._whoisTurn = 0;
          }
          selectTeamModule.setServer();
          response = {
            response: 0,
            playerid: playerid,
            side: socket.yourTurn
          }
        }
        socket.emit("selectPlayer", response);
        selectTeamModule._moduleEmitter.emit("infoChanged");
      })
      socket.on('disconnect',()=>{

      })
    })
    app.use("/", router);
    return app;
  }

  adminRouter(io) {
    const selectTeamModule = this;
    const app = express();
    app.use("/", express.static(selectTeamModule._absolutePath+"/admin"));
    io.on("connection", (socket)=>{
      selectTeamModule._moduleEmitter.on("infoChanged",()=>{
        io.emit("infoChanged", {
          notSelected: this._NotSelected,
          team1Selected: this._Team1Selected,
          team2Selected: this._Team2Selected,
          whoisTurn: this._whoisTurn,
          team1Code: this._Team1Code,
          team2Code: this._Team2Code,
          immediately: this._immediately
        });
      });
      socket.on("infoChanged", (data)=>{
        selectTeamModule._moduleEmitter.emit("infoChanged");
      })
      socket.on("setTeam", (data)=>{
         var playerid = data.playerid;
         var side = data.side;
         var response = selectTeamModule.setTeam(playerid, side);
         socket.emit("setTeam", response);
         selectTeamModule._moduleEmitter.emit("infoChanged");
         selectTeamModule._moduleEmitter.emit("teamChanged");
      })
      socket.on("setTeamLeader", (data)=>{
        var playerid = data.playerid;
        var side = data.side;
        require('crypto').randomBytes(16, function(err, buf){
          var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');;
          if(side==0){
            selectTeamModule._Team1Code = token;
          } else {
            selectTeamModule._Team2Code = token;
          }
          var playeridFrom = ServerConfig.serverAdminEugNetId;
          const playeridTo = playerid;
          const sendMsg = new EugPacketStruct.Wargame3.DedicatedToUser.C2();
          sendMsg.ChatLength = 0;
          sendMsg.CommandCode = 0xC2;
          sendMsg.CommandLen = 0;
          sendMsg.WhoSend = 0;
          sendMsg.EugNetId = parseInt(playeridFrom);
          sendMsg.Type = 0x65;
          sendMsg.Unknown1 = 0x010000;
          sendMsg.Padding = 0;
          sendMsg.Chat = "[Server Notice] Copy and paste below link to select your team member";

          const sendMsg2 = new EugPacketStruct.Wargame3.DedicatedToUser.C2();
          sendMsg2.ChatLength = 0;
          sendMsg2.CommandCode = 0xC2;
          sendMsg2.CommandLen = 0;
          sendMsg2.WhoSend = 0;
          sendMsg2.EugNetId = parseInt(playeridFrom);
          sendMsg2.Type = 0x65;
          sendMsg2.Unknown1 = 0x010000;
          sendMsg2.Padding = 0;
          sendMsg2.Chat = "https://wargame2nakwonelec2.nakwonelec.com" + "/SelectTeam/" + token;
          eugRCON.sendProtocolsFromDedicatedToUsers(playeridTo, sendMsg2);

          var response = selectTeamModule.setTeam(playerid, side);
          socket.emit("setTeamLeader", response);
          selectTeamModule._moduleEmitter.emit("infoChanged");
          selectTeamModule._moduleEmitter.emit("teamChanged");
        })
      })
      socket.on("setWhoisTurn", (data)=>{
        selectTeamModule._whoisTurn = data.whoisTurn;
        socket.emit("setWhoisTurn", {
          response: 0,
          whoisTurn: data.whoisTurn
        })
        selectTeamModule._moduleEmitter.emit("infoChanged");
      })
      socket.on("setTeamCode", (data)=>{
        var side = data.side;
        var code = data.code;
        var response;
        switch(side) {
          case EugPlayer.Enum.Side.Bluefor:
            selectTeamModule._Team1Code = code.trim();
            break;
          case EugPlayer.Enum.Side.Redfor:
            selectTeamModule._Team2Code = code.trim();
            break;
          default:
            response = {
              response: -1,
              error: "Unknown side: " + side
            };
        }
        if(!response){
          response = {
            response: 0,
            side: side,
            code: code.trim()
          }
        }
        socket.emit("setTeamCode", response);
        selectTeamModule._moduleEmitter.emit("infoChanged");
      })
      socket.on("resetSelectTeam", (data)=>{
        selectTeamModule._NotSelected =  Object.values(selectTeamModule._serverState.players).map((player)=>{
          return player.playerid;
        })
        selectTeamModule._Team1Selected = [];
        selectTeamModule._Team2Selected = [];
        socket.emit("resetSelectTeam", {
          response: 0
        })
        selectTeamModule._moduleEmitter.emit("infoChanged");
        selectTeamModule._moduleEmitter.emit("teamChanged");
      })
      socket.on("setImmediately", (data)=>{
        var immediately = data.immediately;
        selectTeamModule._immediately = immediately;
        selectTeamModule._moduleEmitter.emit("infoChanged");
      })
      socket.on("disconnect", ()=>{
      })
    })
    return app;
  }

  setTeam(playerid, side){
    if(this._NotSelected.indexOf(playerid)>-1){
      this._NotSelected.splice(this._NotSelected.indexOf(playerid), 1);
    } else if(this._Team1Selected.indexOf(playerid)>-1){
      this._Team1Selected.splice(this._Team1Selected.indexOf(playerid),1);
    } else if(this._Team2Selected.indexOf(playerid)>-1){
      this._Team2Selected.splice(this._Team2Selected.indexOf(playerid),1);
    } else {
      return {
        response: -1,
        error: "There is no player: " + playerid
      };
    }
    switch(side) {
      case EugPlayer.Enum.Side.Bluefor:
        this._Team1Selected.push(playerid);
        break;
      case EugPlayer.Enum.Side.Redfor:
        this._Team2Selected.push(playerid);
        break;
      case -1:
        this._NotSelected.push(playerid);
        break;
      default:
        return {
          response: -1,
          error: "Unknown side: " + side
        };
    }
    return {
      response: 0,
      playerid: playerid,
      side: side
    };
  }

  // sendAdminInfo(socket){
  //   socket.emit("infoChanged", {
  //     notSelected: this._NotSelected,
  //     team1Selected: this._Team1Selected,
  //     team2Selected: this._Team2Selected,
  //     whoisTurn: this._whoisTurn,
  //     team1Code: this._Team1Code,
  //     team2Code: this._Team2Code
  //   });
  // }

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
  return new SelectTeamModule(serverState, eugEmitter, eugRCON, importedModules, absolutePath);
}