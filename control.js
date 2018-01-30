/* Server Global variable */
var players = {};
var infoRun = true;

var app = require('express')();
var express = require('express');
var server = require('http').createServer(app);
// http server를 socket.io server로 upgrade한다
var io = require('socket.io')(server);

// localhost:3000으로 서버에 접속하면 클라이언트로 index.html을 전송한다
app.use(express.static('public'));
//app.get('/', function(req, res) {
//  res.sendFile(__dirname + '/index.html');
//});

// connection event handler
// connection이 수립되면 event handler function의 인자로 socket인 들어온다
io.on('connection', function(socket) {

  // 접속한 클라이언트의 정보가 수신되면
  socket.on('login', function(data) {
    console.log('Client logged-in:\n name:' + data.name + '\n userid: ' + data.userid);

    // socket에 클라이언트 정보를 저장한다
    socket.name = data.name;
    socket.userid = data.userid;

    // 접속된 모든 클라이언트에게 메시지를 전송한다
    io.emit('login', data.name );

    setInterval(function(){
      var msg = {
          ServerSettings: ServerSettings,
          players: players
            };
      io.emit('chat',msg);
        },1000);
  });

  // 클라이언트로부터의 메시지가 수신되면
  socket.on('chat', function(data) {
    console.log('Message from %s: %s', socket.name, data.msg);

    var msg = {
      from: {
        name: socket.name,
        userid: socket.userid
      },
      msg: data.msg
    };

    // 메시지를 전송한 클라이언트를 제외한 모든 클라이언트에게 메시지를 전송한다
    //socket.broadcast.emit('chat', msg);

    // 메시지를 전송한 클라이언트에게만 메시지를 전송한다
    // socket.emit('s2c chat', msg);

    // 접속된 모든 클라이언트에게 메시지를 전송한다
    io.emit('chat', msg);

    // 특정 클라이언트에게만 메시지를 전송한다
    // io.to(id).emit('s2c chat', data);
  });

  // force client disconnect from server
  socket.on('forceDisconnect', function() {
    socket.disconnect();
  })

  socket.on('disconnect', function() {
    console.log('user disconnected: ' + socket.name);
  });
});

server.listen(3000, function() {
  console.log('Socket IO server listening on port 3000');
});

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
  register_event('Variable (.*) set to "*([^"]*)', setServerSetting);
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
