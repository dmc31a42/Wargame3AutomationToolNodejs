const express = require('express');
const EugPlayer = require('../../EugPlayer');
const EventEmitter = require('events');
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
    router.get("/", (req, res)=>{
      res.send("SelectTeam public get");
    })
    router.get('/:code', (req, res)=>{
      var targetTeam;
      var whoisTurn;
      switch(req.params.code){
        case selectTeamModule._Team1Code:
          targetTeam = selectTeamModule._Team1Selected;
          whoisTurn = 0;
          break;
        case selectTeamModule._Team2Code:
          targetTeam = selectTeamModule._Team2Selected;
          whoisTurn = 1;
        default:
          res.status(404);
          return res.redirect("/SelectTeam");
      }
      io.on('connection', (socket)=>{
        selectTeamModule._moduleEmitter.on("infoChanged",()=>{
          io.emit("infoChanged",{
            notSelected: this._NotSelected,
            team1Selected: this._Team1Selected,
            team2Selected: this._Team2Selected,
            whoisTurn: this._whoisTurn,
          })
        });
        socket.on("infoChanged",()=>{
          socket.emit("infoChanged", {
            notSelected: this._NotSelected,
            team1Selected: this._Team1Selected,
            team2Selected: this._Team2Selected,
            whoisTurn: this._whoisTurn,
          })
        })
        socket.on("selectPlayer", (data)=>{
          var playerid = data.playerid;
          var response;
          if(selectTeamModule._whoisTurn != whoisTurn) {
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
            targetTeam.push(playerid);
            if(selectTeamModule._whoisTurn == 0) {
              selectTeamModule._whoisTurn = 1;
            } else {
              selectTeamModule._whoisTurn = 0;
            }
            selectTeamModule.setServer();
            response = {
              response: 0,
              playerid: playerid,
              side: whoisTurn
            }
          }
          socket.emit("selectPlayer", response);
          selectTeamModule._moduleEmitter.emit("infoChanged");
        })
        socket.on('disconnect',()=>{

        })
      })
      res.send("default_module public get");
    })
    return router;
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