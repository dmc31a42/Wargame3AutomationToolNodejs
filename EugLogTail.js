//"use strinct";
/* Server Global variable */
// const Tail = require('./tail.js').Tail;
const Tail = require('./tail').Tail;
const EugPlayer = require('./EugPlayer.js');
const ServerState = require('./EugServerState');

/**
 * serverlog.txt에서 로그를 읽어서 서버와 플레이어의 상태를 {@link EugServerState}에 저장하는 클래스
 * @class
 * @fires EugEmitter#playerConnected
 * @fires EugEmitter#playerChanged
 * @fires EugEmitter#playerDeckChanged
 * @fires EugEmitter#playerLevelChanged
 * @fires EugEmitter#playerDeleted
 * @fires EugEmitter#playerSideChanged
 * @fires EugEmitter#playerNameChanged
 * @fires EugEmitter#serverStateChanged
 * @fires EugEmitter#server_Property_Changed
 * @fires EugEmitter#serverPropertyChanged
 */
class EugLogTail{
    /**
     * 
     * @param {EugServerState} serverState 
     * @param {EugEmitter} eugEmitter 
     * @param {EugTcpProxy} eugTcpProxyBtwUserAndDedicated 
     */
    constructor(serverState, eugEmitter, eugTcpProxyBtwUserAndDedicated){
        /**
         * @type {EugServerState}
         */
        this.serverState = serverState;
        /**
         * @type {EugEmitter}
         */
        this.eugEmitter = eugEmitter;
        /**
         * @type {EugTcpProxy}
         */
        this.eugTcpProxyBtwUserAndDedicated = eugTcpProxyBtwUserAndDedicated;
        /**
         * @type {boolean}
         */
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
            player.side = 0;
            player._connectCorrectly = true;
            // This part is processed in EugTcpProxy
            // player.IP = RegExpExec[4];
            // player.Port = RegExpExec[5];
            // player.country_code = "XX";
            // player.country_name = "Unknown";

            if(!eugLogTail._infoRun) {
                eugEmitter.emit("serverStateChanged");
                /**
                 * 플레이어가 서버에 정상적으로 접속하였을 때 이벤트가 발생함
                 * 비밀번호 오류 등으로 접속에 실패한 경우 발생하지 않음
                 * @event EugEmitter#playerConnected
                 * @param {number} playerid
                 */
                eugEmitter.emit("playerConnected", player.playerid);
                /**
                 * 플레이어의 정보가 변경되었을 때 이벤트가 발생함
                 * 플레이어가 접속했을 때에도 이벤트가 발생함
                 * @event EugEmitter#playerChanged
                 * @param {number} playerid
                 */
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
                /**
                 * 플레이어의 Deck이 설정, 변경되었을 때 이벤트가 발생함
                 * PlayerDeckContent로 이름이 바뀌어야 하고, player_Property_Changed 이벤트로 통합해야함
                 * @event EugEmitter#playerDeckChanged
                 * @param {number} playerid
                 * @param {number} level
                 */
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
                /**
                 * 플레이어의 Level이 설정, 변경되었을 때 이벤트가 발생함
                 * PlayerLevel로 이름이 바뀌어야 하고, player_Property_Changed 이벤트로 통합해야함
                 * @event EugEmitter#playerLevelChanged
                 * @param {number} playerid
                 * @param {number} level
                 */
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
                /**
                 * 플레이어의 ELO가 설정, 변경되었을 때 이벤트가 발생함
                 * PlayerElo로 이름이 바뀌어야 하고, player_Property_Changed 이벤트로 통합해야함
                 * @event 
                 * @param {number} playerid
                 * @param {float} elo
                 */
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
                /**
                 * 플레이어가 접속을 종료한 것과 같이 플레이어 정보가 삭제될 때 이벤트가 발생함
                 * @event EugEmitter#playerDeleted
                 * @param {number} playerid
                 */
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
                /**
                 * 플레이어의 팀이 설정, 변경되었을 때 이벤트가 발생함
                 * PlayerAlliance로 이름이 바뀌어야 하고, player_Property_Changed 이벤트로 통합해야함
                 * @event EugEmitter#playerSideChanged
                 * @param {number} playerid
                 * @param {number} side
                 */
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
                /**
                 * 플레이어 이름이 설정, 변경되었을 때 이벤트가 발생함
                 * PlayerName으로 이름이 바뀌어야 하고, player_Property_Changed 이벤트로 통합해야함
                 * @event EugEmitter#playerNameChanged
                 * @param {number} playerid
                 * @param {String} name
                 */
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
                /**
                 * @event EugEmitter#serverStateChanged
                 * 
                 */
                eugEmitter.emit("serverStateChanged");
                /**
                 * 서버의 각 _Property_가 바뀔 때 이벤트가 발생됨
                 * _Property_ 자리에 각 Property가 첫글자의 문자가 대문자로 바뀌어 들어감
                 * @event EugEmitter#server_Property_Changed
                 * @type {number | String}
                 */
                eugEmitter.emit("server" + eventName + "Changed", eugLogTail.serverState[key]);
                /**
                 * 서버의 프로퍼티가 바뀌었을 경우 이벤트가 발생됨
                 * 프로퍼티의 이름과 값이 같이 제공됨
                 * @event EugEmitter#serverPropertyChanged
                 * @param {String} property
                 * @param {number | String} value
                 */
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
    /**
     * Tail을 시작하는 함수
     * @function
     */
    watch(){
        this._tail.watch(0);
        console.log("watch start");
    }
    /**
     * Tail을 중지하는 함수
     * @function
     */
    unwatch(){
        this._tail.unwatch();
    }
}

module.exports = function(serverState, eugEmitter, eugTcpProxyBtwUserAndDedicated){
    return new EugLogTail(serverState, eugEmitter, eugTcpProxyBtwUserAndDedicated);
}