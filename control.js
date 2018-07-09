"use strinct";
var http = require('http');

/* Server Global variable */
var players = {};
var infoRun = false;
var NodeConfig = require('./node-config');
var exec = require('child_process').exec;
var AdminCode = NodeConfig.AdminCode;
var Team1SelectorSocketId = '';
var Team2SelectorSocketId = '';

const delay = require('delay');
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

function executeRCON(command) {
	var execution_string = NodeConfig.rconPath + 
	    ' -H ' + NodeConfig.rconRemoteHost + 
	    ' -P ' + NodeConfig.rconRemotePort +
        " -p '" + NodeConfig.rconPassword + "'" +
		' "' + command + '"';
	
	var child = exec(execution_string, function (error, stdout, stderr) {
		//console.log('stdout: ' + stdout);
		//console.log('stderr: ' + stderr);
		//if (error !== null) {
		//	console.log('exec error: ' + error);
		//}
	});
}

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
    //io.emit('login', data.name );

    var msg = {
      ServerSettings: ServerSettings,
      players: players
    };
    socket.emit('chat',msg);

  });
  
  socket.on('login:admin', function(data){
    if(data.Code == AdminCode){
      socket.join('Admin');
      socket.emit('login:admin',{
        result: 'OK'
      });
    }
  });

  socket.on('login:SelectTeam',function(data){
    if(data.Code == customModSettingsAdmin.SelectTeam.Team1SelectorCode){
      socket.join('SelectTeam');
      //Team1SelectorSocketId = socket.id;
      socket.WitchSide = Side.Bluefor;
      socket.emit('login:SelectTeam',{
        result: 'OK'
      });
      emitAdminInfo();
      socket.emit('SelectTeam:yourTeam',{
        yourTeam: 0
      });
    } else if(data.Code == customModSettingsAdmin.SelectTeam.Team2SelectorCode){
      socket.join('SelectTeam');
      //Team2SelectorSocketId = socket.id;
      socket.WitchSide = Side.Redfor;
      socket.emit('login:SelectTeam',{
        result: 'OK'
      });
      emitAdminInfo();
      socket.emit('SelectTeam:yourTeam',{
        yourTeam: 1
      });
    } else {
      socket.emit('login:SelectTeam',{
        result: 'You have no access prilv'
      });
    }
  });

  socket.on('SelectTeam:SelectPlayer', function(data){
    var rooms = io.sockets.adapter.rooms['SelectTeam'];
    if(rooms && rooms.sockets[socket.id] == true){
		  //if(socket.id == Team1SelectorSocketId && customModSettings.SelectTeam.whoisSelectTeam == 0){
      if(socket.WitchSide == Side.Bluefor && customModSettings.SelectTeam.whoisSelectTeam == 0){
        data.playerid.forEach(function(value, index, array){
          customModSettings.SelectTeam.Team1Selected.push(parseInt(value));
          if(customModSettings.SelectTeam.NotSelected.indexOf(parseInt(value))>-1){
            customModSettings.SelectTeam.NotSelected.splice(customModSettings.SelectTeam.NotSelected.indexOf(parseInt(value)), 1);
          }
          if(customModSettings.SelectTeam.ApplyImmediately == 1){
            setSelectTeam2Player();
          }
        });
        customModSettings.SelectTeam.whoisSelectTeam = 1;
      //} else if(socket.id == Team2SelectorSocketId && customModSettings.SelectTeam.whoisSelectTeam == 1) {
      } else if(socket.WitchSide == Side.Redfor && customModSettings.SelectTeam.whoisSelectTeam == 1) {
        data.playerid.forEach(function(value, index, array){
          customModSettings.SelectTeam.Team2Selected.push(parseInt(value));
          if(customModSettings.SelectTeam.NotSelected.indexOf(parseInt(value))>-1){
            customModSettings.SelectTeam.NotSelected.splice(customModSettings.SelectTeam.NotSelected.indexOf(parseInt(value)), 1);
          }
          if(customModSettings.SelectTeam.ApplyImmediately == 1){
            setSelectTeam2Player();
          }
        });
        customModSettings.SelectTeam.whoisSelectTeam = 0;
      }
      emitAdminInfo();
      console.log('customModSettings.SelectTeam.NotSelected.length : ' + customModSettings.SelectTeam.NotSelected.length);
      if(customModSettings.SelectTeam.NotSelected.length == 0){
        //delay(1000).then( function(){
        function setSelectTeam2Player() {
          var Team2Length = customModSettings.SelectTeam.Team2Selected.length;
          var Team1Length = customModSettings.SelectTeam.Team1Selected.length;

          var length = Team1Length>=Team2Length ? Team1Length : Team2Length;

          for(var i=0; i<length; i++){
            if(i<Team1Length){
              console.log('Admin:setpvar :  setpvar ' + customModSettings.SelectTeam.Team1Selected[i] + ' ' + 'PlayerAlliance' + ' ' + 0);
              executeRCON('setpvar ' + customModSettings.SelectTeam.Team1Selected[i] + ' ' + 'PlayerAlliance' + ' ' + 0);
              emitAdminInfo();
            }
            if(i<Team2Length){
              console.log('Admin:setpvar :  setpvar ' + customModSettings.SelectTeam.Team2Selected[i] + ' ' + 'PlayerAlliance' + ' ' + 1);
              executeRCON('setpvar ' + customModSettings.SelectTeam.Team2Selected[i] + ' ' + 'PlayerAlliance' + ' ' + 1);
              emitAdminInfo();
            }
          }
        }
        setSelectTeam2Player();
        //});
      }
	  }
  });

  
  socket.on('Admin:resetSelectTeam',function(){
    var rooms = io.sockets.adapter.rooms['Admin'];
    if(rooms && rooms.sockets[socket.id] == true){
      resetSelectTeam();
    }
    emitAdminInfo();
  });

  socket.on('Admin:setTeam', function(data){
    var rooms = io.sockets.adapter.rooms['Admin'];
    function setTeam(playerid, side){
      if(side == -1){
        customModSettings.SelectTeam.NotSelected.push(parseInt(playerid));
      } else if(side == 0){
        customModSettings.SelectTeam.Team1Selected.push(parseInt(playerid));
      } else if(side == 1){
        customModSettings.SelectTeam.Team2Selected.push(parseInt(playerid));
      }
    }
    if(rooms && rooms.sockets[socket.id] == true){
      if(customModSettings.SelectTeam.NotSelected.indexOf(parseInt(data.playerid))>-1){
        customModSettings.SelectTeam.NotSelected.splice(customModSettings.SelectTeam.NotSelected.indexOf(parseInt(data.playerid)), 1);
        setTeam(data.playerid,data.side);
      } else if(customModSettings.SelectTeam.Team1Selected.indexOf(parseInt(data.playerid))>-1){
        customModSettings.SelectTeam.Team1Selected.splice(customModSettings.SelectTeam.Team1Selected.indexOf(parseInt(data.playerid)), 1);
        setTeam(data.playerid,data.side);
      } else if(customModSettings.SelectTeam.Team2Selected.indexOf(parseInt(data.playerid))>-1){
        customModSettings.SelectTeam.Team2Selected.splice(customModSettings.SelectTeam.Team2Selected.indexOf(parseInt(data.playerid)), 1);
        setTeam(data.playerid,data.side);
      }
    }
    emitAdminInfo();
  });

  socket.on('Admin:command', function(data){
    var rooms = io.sockets.adapter.rooms['Admin'];
    if(rooms && rooms.sockets[socket.id] == true){
      executeRCON(data.command);
      console.log(data.command);
    }
  })

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
    //io.emit('chat', msg);

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
  
  socket.on('Admin:SendServerSetting', function(data) {
    var rooms = io.sockets.adapter.rooms['Admin'];
    if(rooms && rooms.sockets[socket.id] == true){
		  console.log('SendServerSetting :  setsvar ' + data.Property + ' ' + data.value);
		  executeRCON('setsvar ' + data.Property + ' ' + data.value);
	  }
  });
  
  socket.on('Admin:requestServerSetting', function() {
    var rooms = io.sockets.adapter.rooms['Admin'];
    if(rooms && rooms.sockets[socket.id] == true){
		  emitAdminInfo();
	  }
  });

  socket.on('Admin:setpvar', function(data) {
    var rooms = io.sockets.adapter.rooms['Admin'];
    if(rooms && rooms.sockets[socket.id] == true){
      console.log('Admin:setpvar :  setpvar ' + data.playerid + ' ' + data.Property + ' ' + data.value);
		  executeRCON('setpvar ' + data.playerid + ' ' + data.Property + ' ' + data.value);
	  }
  });

  socket.on('Admin:changewhoisSelectTeam', function(data){
    var rooms = io.sockets.adapter.rooms['Admin'];
    if(rooms && rooms.sockets[socket.id] == true){
      customModSettings.SelectTeam.whoisSelectTeam =  data.whoisSelectTeam;
      console.log('Admin:changewhoisSelectTeam : ' + customModSettings.SelectTeam.whoisSelectTeam);
      emitAdminInfo();
    }
  });

  socket.on('Admin:SetSelectTeamAccessCode', function(data){
    var rooms = io.sockets.adapter.rooms['Admin'];
    if(rooms && rooms.sockets[socket.id] == true){
      if(data.key == 0){
        customModSettingsAdmin.SelectTeam.Team1SelectorCode = data.value;
      }
      if(data.key == 1){
        customModSettingsAdmin.SelectTeam.Team2SelectorCode = data.value;
      }
      console.log('Admin:SetSelectTeamAccessCode : ' + customModSettingsAdmin.SelectTeam.Team1SelectorCode + ' / ' + customModSettingsAdmin.SelectTeam.Team2SelectorCode);
      emitAdminInfo();
    }
  });

  socket.on('Admin:SetSelectTeamSetting', function(data){
    var rooms = io.sockets.adapter.rooms['Admin'];
    if(rooms && rooms.sockets[socket.id] == true){
      customModSettings.SelectTeam[data.property] = data.value;
      emitAdminInfo();
    }
  })

  socket.on('SelectTeam:requestServerSetting', function(){
    emitAdminInfo();
  })

});

server.listen(NodeConfig.ServicePort, function() {
  console.log('Socket IO server listening on port ' + NodeConfig.ServicePort);
});

Tail = require('tail').Tail;

tail = new Tail("../serverlog.txt", {
	separator: '\n',
	fromBeginning: true,
	follow: true
});

tail.on("line", function(data) {
  for(var key in registeredEvents){
    var RegExpExec = RegExp(key).exec(data);
    if(RegExpExec) {
      registeredEvents[key](RegExpExec);
	  showServerSetting();
	  emitAdminInfo();
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

var ServerSettings = {
};
var customModSettingsAdmin = {
  SelectTeam: {
    Team1SelectorCode: '',
    Team2SelectorCode: ''
  }
};
var customModSettings = {
  currentMod : 'SelectTeam',
  SelectTeam : {
    whoisSelectTeam : 0,
    Team1Selected: [],
    Team2Selected: [],
    NotSelected: [],
    HowManySelect : 1,
  },  
};

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
  register_event('Variable (.*) set to "*([^"]*)', _setServerSetting);
}

var parserValue = {
	NbMaxPlayer: function(str){return parseInt(str)},
	NbPlayer: function(str){return parseInt(str)},
	Seed: function(str){return parseInt(str)},
	Private: function(str){return parseInt(str)},
	GameState: function(str){return parseInt(str)},
	NeedPassword: function(str){return parseInt(str)},
	GameType: function(str){return parseInt(str)},
	InitMoney: function(str){return parseInt(str)},
	TimeLimit: function(str){return parseInt(str)},
	ScoreLimit: function(str){return parseInt(str)},
	VictoryCond: function(str){return parseInt(str)},
	IncomeRate: function(str){return parseInt(str)},
	WarmupCountdown: function(str){return parseInt(str)},
	DeploiementTimeMax: function(str){return parseInt(str)},
	DebriefingTimeMax: function(str){return parseInt(str)},
	LoadingTimeMax: function(str){return parseInt(str)},
	NbMinPlayer: function(str){return parseInt(str)},
	DeltaMaxTeamSize: function(str){return parseInt(str)},
	MaxTeamSize: function(str){return parseInt(str)},
	NationConstraint: function(str){return parseInt(str)},
	ThematicConstraint: function(str){return parseInt(str)},
	DateConstraint: function(str){return parseInt(str)},
	side: function(str){return parseInt(str)},
	level: function(str){return parseInt(str)},
	elo: function(str){return parseFloat(str)},
};
function _setServerSetting(RegExpExec){
	var key = RegExpExec[1];
	var value = RegExpExec[2];
	if(parserValue[key]){
    ServerSettings[RegExpExec[1]] = parserValue[key](value);
    setServerSetting(RegExpExec[1], parserValue[key](value));
	} else {
    ServerSettings[RegExpExec[1]] = value;
    setServerSetting(RegExpExec[1], value);
	}
}

function setServerSetting(property, value){
  if(property == 'GameState') {
    if(value == GameState.Loading) {
      resetSelectTeam();
    }
  }
}

function showServerSetting(){
  console.log(ServerSettings);
  console.log(players);
}

function emitAdminInfo(){
  io.sockets.in('Admin').emit('Admin',{
    ServerSettings: ServerSettings,
    players: players,
    customModSettings : customModSettings,
    customModSettingsAdmin : customModSettingsAdmin
  });
  io.sockets.in('SelectTeam').emit('SelectTeam',{
    players: players,
    customModSettings : customModSettings
  });
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
	    playerid: parseInt(playerid),
      side: Side.Bluefor,
      deck: "",
      level: 0,
      elo: 0.0,
      name: "",
      UserSessionId: RegExpExec[2],
      socket: RegExpExec[3],
      IP: RegExpExec[4],
      Port: RegExpExec[5],
      country_code: 'XX',
      country_name: 'Unknwon',
      u24: {},
    };
    emitAdminInfo();
  }

  if(!infoRun) {
    on_player_connection(parseInt(playerid));
  }
}

function on_player_connection(playerid){
  CustomModSelectTeamAddPlayer(playerid);
  if(players[playerid].IP.match("192.168.") && players[playerid].IP.match("192.168.").index != -1) {
    players[playerid].country_code = "__";
    players[playerid].country_name = "Special";
  } else if(NodeConfig.ipstack_API_KEY && NodeConfig.ipstack_API_KEY != '') {
    var option = {
      hostname: 'api.ipstack.com',
      port: 80,
      path: '/'+ players[playerid].IP + '?access_key=' + NodeConfig.ipstack_API_KEY,
      method: 'GET'
    };
    var req = http.request(option, function(res) {
      //console.log(res);
      var responseData = '';
      res.on('data', function(chunk){
        responseData = responseData + chunk;
      });
      res.on('end', function(){
        IP_request_Callback(responseData, playerid);
      })
    })
    req.on('error', (e) => {
      console.error(e);
    });
    req.end();
  }
  var req_u24 = http.request({
    hostname: '178.32.126.73',
    port: 8080,
    path: '/stats/u24_' + playerid,
    method: 'GET'
  }, function(res){
    var responseData = '';
      res.on('data', function(chunk){
        responseData = responseData + chunk;
      });
      res.on('end', function(){
        u24_Callback(responseData, playerid);
      })
  })
  req_u24.on('error', (e) => {
    console.error(e);
  });
  req_u24.end();
  emitAdminInfo();
}
function u24_Callback(responseData, playerid){
  var JSONData = JSON.parse(responseData.toString());
  if(players[playerid] && JSONData._id){
    players[playerid].u24 = JSONData;
    emitAdminInfo();
  }
}

function IP_request_Callback(responseData, playerid){
  var JSONData = JSON.parse(responseData.toString())
  if(players[playerid] && JSONData.country_code && JSONData.country_code != '') {
    players[playerid].country_code = JSONData.country_code;
    players[playerid].country_name = JSONData.country_name;
    emitAdminInfo();
  } else {
    // players[playerid].country_code = 'XX';
    // players[playerid].country_name = JSONData.country_name;
  }
}

function CustomModSelectTeamAddPlayer(playerid){
  customModSettings.SelectTeam.NotSelected.push(parseInt(playerid));
}

function _on_player_deck_set(RegExpExec){
  var playerid = RegExpExec[1];
  var playerdeck = RegExpExec[2];

  players[playerid].deck = playerdeck;

  if(!infoRun){
    on_player_deck_set(playerid, playerdeck);
  }
  emitAdminInfo();
}

function on_player_deck_set(playerid, playerdeck){
}

function _on_player_level_set(RegExpExec){
  var playerid = RegExpExec[1];
  var playerlevel = parseInt(RegExpExec[2]);

  players[playerid].level = playerlevel;

  if(!infoRun){
    on_player_level_set(playerid, playerlevel);
  }
  emitAdminInfo();
}

function on_player_level_set(playerid, playerlevel){
}

function _on_player_elo_set(RegExpExec){
  var playerid = RegExpExec[1];
  var playerelo = parseFloat(RegExpExec[2]);

  players[playerid].elo = playerelo;

  if(!infoRun){
    on_player_elo_set(playerid, playerelo);
  }
  emitAdminInfo();
}

function on_player_elo_set(playerid, playerelo){
}

function _on_player_disconnect(RegExpExec){
  var playerid = RegExpExec[1];

  if(!infoRun){
    on_player_disconnect(parseInt(playerid));
  }
  delete players[playerid];
  emitAdminInfo();
}

function on_player_disconnect(playerid){
  if(customModSettings.SelectTeam.NotSelected.indexOf(playerid)>-1){
    customModSettings.SelectTeam.NotSelected.splice(customModSettings.SelectTeam.NotSelected.indexOf(playerid), 1);
  } else if(customModSettings.SelectTeam.Team1Selected.indexOf(playerid)>-1){
    customModSettings.SelectTeam.Team1Selected.splice(customModSettings.SelectTeam.Team1Selected.indexOf(playerid), 1);
  } else if(customModSettings.SelectTeam.Team2Selected.indexOf(playerid)>-1){
    customModSettings.SelectTeam.Team2Selected.splice(customModSettings.SelectTeam.Team2Selected.indexOf(playerid), 1);
  }
}

function _on_player_side_change(RegExpExec){
  var playerid = RegExpExec[1];
  var playerside = parserValue['side'](RegExpExec[2]);
  players[playerid].side = playerside == 0 ? Side.Bluefor : Side.Redfor;

  if(!infoRun){
    on_player_side_change(playerid, playerside);
  }
  emitAdminInfo();
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
  emitAdminInfo();
}

function on_player_name_change(playerid, playername){
}

function _on_switch_to_launch(RegExpExec){
  ServerSettings["GameState"] = GameState.Launch;

  if(!infoRun){
    on_switch_to_launch();
  }
  emitAdminInfo();
}

function on_switch_to_launch(){
}

function _on_switch_to_cancel_launch(RegExpExec){
  ServerSettings["GameState"] = GameState.Lobby;

  if(!infoRun){
    on_switch_to_cancel_launch();
  }
  emitAdminInfo();
}

function on_switch_to_cancel_launch(){
}

function resetSelectTeam() {
  customModSettings.SelectTeam.NotSelected = Object.keys(players).map(item=>parseInt(item));
  customModSettings.SelectTeam.Team1Selected = [];
  customModSettings.SelectTeam.Team2Selected = [];
  customModSettings.SelectTeam.whoisSelectTeam = 0;
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
