//"use strinct";
/* Server Global variable */
// const Tail = require('./tail.js').Tail;
const Tail = require('./tail').Tail;
const EugPlayer = require('./EugPlayer.js');
const ServerState = require('./EugServerState');

class EugLogTail{
    constructor(serverState, eugEmitter, eugTcpProxyBtwUserAndDedicated){
        this.serverState = serverState;
        this.eugEmitter = eugEmitter;
        this.eugTcpProxyBtwUserAndDedicated = eugTcpProxyBtwUserAndDedicated;
        this._infoRun = true;
        //registeredEvents initialize
        this.initializeRegisteredEvents();
        //registeredEvents initialize
        // tail initialize
        this.initializeTail();
        // tail initialize
    }

    initializeRegisteredEvents(){
        var eugLogTail = this;
        var eugEmitter = this.eugEmitter;
        const registeredEvents = {};
        this._registeredEvents = registeredEvents;
        function register_event(regex, handler){
            registeredEvents[regex]= handler;
        }
        function register_events(){
            /* Client Status */
              register_event("Client added in session \\(EugNetId : ([0-9]+), UserSessionId : ([0-9]+), socket : ([0-9]+), IP : (.*):([0-9]+)\\)", _on_player_connect);
              register_event('Client ([0-9]+) variable PlayerDeckContent set to "(.*)"', _on_player_deck_set);
              register_event('Client ([0-9]+) variable PlayerLevel set to "(.*)"', _on_player_level_set);
              register_event('Client ([0-9]+) variable PlayerElo set to "(.*)"', _on_player_elo_set);
              register_event('Client ([0-9]+) variable PlayerAlliance set to "([0-9])"', _on_player_side_change);
              register_event('Client ([0-9]+) variable PlayerName set to "(.*)"', _on_player_name_change);
              register_event('Disconnecting client ([0-9]+)', _on_player_disconnect);
            /* Game Status */
              //register_event('Entering in loading phase state', event_receive);
              //register_event('Entering in debriephing phase state', event_receive);
              //register_event('Entering in matchmaking state', event_receive);
              register_event('Launch game', _on_switch_to_launch);
              register_event('Canceling launch game', _on_switch_to_cancel_launch);
            /* Server Status */
              //register_event('Variable (.*) set to "*([^"]*)', _on_serverstate_change);
              register_event('Variable ([^ ]*) set to "*([^"]*)', _on_serverstate_change); //공백을 무시하게 해야할 듯
        }
        function _on_player_connect(RegExpExec){
            var playerid = RegExpExec[1];
            var player;
            // var playeridKey = Object.keys(eugLogTail.serverState.players).find((element)=>{return element == playerid});
            // // Creating player data struct if no present
            // if(playeridKey){
            //   // does not work includes. so, use indexOf
            //     player = eugLogTail.serverState.players[playeridKey];
            // } else {
            //     player = new EugPlayer();
            //     player.playerid = playerid;
            //     eugLogTail.serverState.players[playerid] = player;
            // }
            var context = Object.values(eugLogTail.eugTcpProxyBtwUserAndDedicated.contexts).find((context)=>{
                if(context.user) {
                    return context.user.playerid == parseInt(playerid);
                }
            })
            if(context){
                player = context.user;
                eugLogTail.serverState.players[player.playerid] = player;
            } else {
                player = new EugPlayer();
                player.playerid = playerid;
                eugLogTail.serverState.players[playerid] = player;
            }
            
            player.UserSessionId = RegExpExec[2];
            player.socket = RegExpExec[3];
            player.side = EugPlayer.Enum.Side.Bluefor;
            player._connectCorrectly = true;
            // This part is processed in EugTcpProxy
            // player.IP = RegExpExec[4];
            // player.Port = RegExpExec[5];
            // player.country_code = "XX";
            // player.country_name = "Unknown";

            if(!eugLogTail._infoRun) {
                eugEmitter.emit("serverStateChanged");
                eugEmitter.emit("playerConnected", player.playerid);
                eugEmitter.emit("playerChanged", player.playerid);
                }
            }

          function _on_player_deck_set(RegExpExec){
            var playerid = RegExpExec[1];
            var playerdeck = RegExpExec[2];
          
            var player = eugLogTail.serverState.players[playerid];
            player.deck = playerdeck;
          
            if(!eugLogTail._infoRun){
                eugEmitter.emit("serverStateChanged");
                eugEmitter.emit("playerChanged", player.playerid);
                eugEmitter.emit("playerDeckChanged", player.playerid, player.deck);
            }
          }
          
          function _on_player_level_set(RegExpExec){
            var playerid = RegExpExec[1];
            var playerlevel = parseInt(RegExpExec[2]);
          
            var player = eugLogTail.serverState.players[playerid];
            player.level = playerlevel;
          
            if(!eugLogTail._infoRun){
                eugEmitter.emit("serverStateChanged");
                eugEmitter.emit("playerChanged", player.playerid);
                eugEmitter.emit("playerLevelChanged", player.playerid, player.level);
            }
          }
          
          function _on_player_elo_set(RegExpExec){
            var playerid = RegExpExec[1];
            var playerelo = parseFloat(RegExpExec[2]);
          
            var player = eugLogTail.serverState.players[playerid];
            player.elo = playerelo;
          
            if(!eugLogTail._infoRun){
                eugEmitter.emit("serverStateChanged");
                eugEmitter.emit("playerChanged", player.playerid);
                eugEmitter.emit("playerEloChanged", player.playerid, player.elo);
            }
          }
          
          function _on_player_disconnect(RegExpExec){
            var playerid = RegExpExec[1];
            var playeridInt = eugLogTail.serverState.players[playerid].playerid;
            delete eugLogTail.serverState.players[playerid];
            var context = Object.values(eugLogTail.eugTcpProxyBtwUserAndDedicated.contexts).find((context)=>{
                if(context.user){
                    return context.user.playerid == parseInt(playerid);
                }
            })
            if(context){
                delete context.user;
            } 
            if(!eugLogTail._infoRun){
                eugEmitter.emit("serverStateChanged");
                eugEmitter.emit("playerChanged", playeridInt);
                eugEmitter.emit("playerDeleted", playeridInt);
            }
            //delete players[playerid];
          }
                    
          function _on_player_side_change(RegExpExec){
            var playerid = RegExpExec[1];
            var playerside = RegExpExec[2]

            var player = eugLogTail.serverState.players[playerid];
            player.side = playerside;
          
            if(!eugLogTail._infoRun){
                eugEmitter.emit("serverStateChanged");
                eugEmitter.emit("playerChanged", player.playerid);
                eugEmitter.emit("playerSideChanged", player.playerid, player.side);
            }
          }
          
          function _on_player_name_change(RegExpExec){
            var playerid = RegExpExec[1];
            var playername = RegExpExec[2];

            var player = eugLogTail.serverState.players[playerid];
            player.name = playername;
          
            if(!eugLogTail._infoRun){
                eugEmitter.emit("serverStateChanged");
                eugEmitter.emit("playerChanged", player.playerid);
                eugEmitter.emit("playerNameChanged", player.playerid, player.name);
            }
          }
          
          function _on_switch_to_launch(RegExpExec){
            eugLogTail.serverState.GameState = ServerState.Enum.GameState.Launch;
            
            if(!eugLogTail._infoRun){
                eugEmitter.emit("serverStateChanged");
                eugEmitter.emit("serverGameStateChanged", eugLogTail.serverState.GameState);
            }
          }
                    
          function _on_switch_to_cancel_launch(RegExpExec){
            eugLogTail.serverState.GameState = ServerState.Enum.GameState.Lobby;
          
            if(!eugLogTail._infoRun){
                eugEmitter.emit("serverStateChanged");
                eugEmitter.emit("serverGameStateChanged", eugLogTail.serverState.GameState);
            }
          }

          function _on_serverstate_change(RegExpExec){
            var key = RegExpExec[1];
            var value = RegExpExec[2];

            eugLogTail.serverState[key] = value;
            var eventName = key.charAt(0).toUpperCase() + key.substr(1);

            if(!eugLogTail._infoRun){
                eugEmitter.emit("serverStateChanged");
                eugEmitter.emit("server" + eventName + "Changed", eugLogTail.serverState[key]);
                eugEmitter.emit("serverPropertyChanged", key, eugLogTail.serverState[key]);
            }
        }
        register_events();
    }

    initializeTail(){
        var eugLogTail = this;
        var tail = new Tail("../serverlog.txt", {
            separator: '\n',
            fromBeginning: true,
            follow: true
        });
        eugLogTail._tail = tail;
        const registeredEvents = eugLogTail._registeredEvents;
        tail.on("line", function(data) {
            for(var key in registeredEvents){
              var RegExpExec = RegExp(key).exec(data);
              if(RegExpExec) {
                registeredEvents[key](RegExpExec);
                //showServerSetting();
                //emitAdminInfo();
              return;
              }
            }
        });
        tail.on("historicalDataEnd", function(end){
            var NbMaxPlayer = eugLogTail.serverState.NbMaxPlayer;
            var NbMinPlayer = eugLogTail.serverState.NbMinPlayer;
            var tempAutoLaunchCond = NbMinPlayer - NbMaxPlayer;
            switch(tempAutoLaunchCond){
                case -1:
                case 0:
                case 1:
                    eugLogTail.serverState.AutoLaunchCond = tempAutoLaunchCond;
                    break;
                default:
                    if(tempAutoLaunchCond>1){
                        eugLogTail.serverState.AutoLaunchCond = 1;
                    } else {
                        eugLogTail.serverState.AutoLaunchCond = -2;
                    }
            }
            eugLogTail._infoRun = false;
            console.log("historicalDataEnd");
        })
        tail.on("error", function(error) {
            console.log('ERROR: ', error);
        });
          
        
    }
    watch(){
        this._tail.watch(0);
        console.log("watch start");
    }

    unwatch(){
        this._tail.unwatch();
    }
}

module.exports = function(serverState, eugEmitter, eugTcpProxyBtwUserAndDedicated){
    return new EugLogTail(serverState, eugEmitter, eugTcpProxyBtwUserAndDedicated);
}