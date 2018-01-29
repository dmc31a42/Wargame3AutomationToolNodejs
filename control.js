/* Server Global variable */
var players = {};
var infoRun = true;



Tail = require('tail').Tail;

tail = new Tail("serverlog.txt", {
	separator: '\n',
	fromBeginning: true,
	follow: true
});

tail.on("line", function(data) {
  for(var key in registeredEvents){
    var RegExpExec = RegExp(key).exec(data);
    if(RegExpExec) {
      registeredEvents[key](RegExpExec);
      return;
    }
  }
});

tail.on("error", function(error) {
  console.log('ERROR: ', error);
});

tail.watch();
console.log("watch start");

var registeredEvents = {};

function register_event(regex, handler){
	registeredEvents[regex]= handler;
}

function event_receive(regExpExec){
  console.log("event_receive : " + regExpExec);
}

var ServerSettings = {};

function register_events(){
/* Client Status */
  register_event("Client added in session \\(EugNetId : ([0-9]+)", _on_player_connect);
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
  register_event('Variable (.*) set to (.*)', setServerSetting);
}

function setServerSetting(RegExpExec){
  ServerSettings[RegExpExec[1]] = RegExpExec[2];
}

function showServerSetting(){
  console.log(ServerSettings);
  console.log(players);
}



/*----------------------------------------------------------------------------------------------------------------------
 --------------------------------------- INTERNAL IMPLEMENTATION DETAILS ----------------------------------------------
 ----------------------------------------------------------------------------------------------------------------------*/

    /* -------------------------------------------
     Service event handlers
     -------------------------------------------*/


function _on_player_connect(RegExpExec){
  var playerid = RegExpExec[1];
  // Creating player data struct if no present
  if(!Object.keys(players).indexOf(String(playerid))>-1){
    // does not work includes. so, use indexOf
    players[playerid] = {
      side: Side.Bluefor,
      deck: "",
      level: 0,
      elo: 0.0,
      name: "",
    };
  }

  if(!infoRun) {
    on_player_connection(playerid);
  }
}

function on_player_connection(playerid){
// important : typeof playerid == "String"
}

function _on_player_deck_set(RegExpExec){
  var playerid = RegExpExec[1];
  var playerdeck = RegExpExec[2];

  players[playerid].deck = playerdeck;

  if(!infoRun){
    on_player_deck_set(playerid, playerdeck);
  }
}

function on_player_deck_set(playerid, playerdeck){
}

function _on_player_level_set(RegExpExec){
  var playerid = RegExpExec[1];
  var playerlevel = RegExpExec[2];

  players[playerid].level = playerlevel;

  if(!infoRun){
    on_player_level_set(playerid, playerlevel);
  }
}

function on_player_level_set(playerid, playerlevel){
}

function _on_player_elo_set(RegExpExec){
  var playerid = RegExpExec[1];
  var playerelo = RegExpExec[2];

  players[playerid].elo = playerelo;

  if(!infoRun){
    on_player_elo_set(playerid, playerelo);
  }
}

function on_player_elo_set(playerid, playerelo){
}

function _on_player_disconnect(RegExpExec){
  var playerid = RegExpExec[1];

  if(!infoRun){
    on_player_disconnect(playerid);
  }
  delete players[playerid];
}

function on_player_disconnect(playerid){
}

function _on_player_side_change(RegExpExec){
  var playerid = RegExpExec[1];
  var playerside = RegExpExec[2];
  players[playerid].side = playerside == 1 ? Side.Redfor : Side.Redfor;

  if(!infoRun){
    on_player_side_change(playerid, playerside);
  }
}

function on_player_side_change(playerid, playerside){
}

function _on_player_name_change(RegExpExec){
  var playerid = RegExpExec[1];
  var playername = RegExpExec[2];
  players[playerid].name = playername;

  if(!infoRun){
    on_player_name_change(playerid, playername);
  }
}

function on_player_name_change(playerid, playername){
}

function _on_switch_to_launch(RegExpExec){
  ServerSettings["GameState"] = GameState.Launch;

  if(!infoRun){
    on_switch_to_launch();
  }
}

function on_switch_to_launch(){
}

function _on_switch_to_cancel_launch(RegExpExec){
  ServerSettings["GameState"] = GameState.Lobby;

  if(!infoRun){
    on_switch_to_cancel_launch();
  }
}

function on_switch_to_cancel_launch(){
}

/* System Enum */
var Side = {
  Bluefor:0,
  Redfor:1
};

var GameState = {
  Lobby: 0,
  Loading: 51,
  Deployment: 52,
  Game: 53,
  Debriefing: 101,
  Launch: 4
};

/* main */
register_events();
setInterval(showServerSetting,1000);
