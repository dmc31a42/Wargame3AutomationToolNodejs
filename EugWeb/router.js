const SERVER_CONFIG = require('../server-config.json');

module.exports = function(serverState, eugEmitter, eugRCON, importedModules, io) {
    this.serverState = serverState;
    this.eugEmitter = eugEmitter;
    this.eugRCON = eugRCON;
    this.importedModules = importedModules;
    const router = require('express').Router();
    const namePathEnableds = [];
    importedModules.forEach((importedModule)=>{
        namePathEnableds.push({
            name: importedModule.moduleInfo.name,
            path: importedModule.moduleInfo.path,
            enabled: importedModule.enabled
        });
    })

    router.post('/admin', (req, res)=>{
        var password = req.body.password;
        if(password == SERVER_CONFIG.AdminCode) {
            req.session.admin = true;
            res.redirect("/admin");
        } else {
            res.status(404);
            res.redirect("/");
        }
    })
    router.get('/admin', (req, res) => {
        if(req.session.admin){
            res.render('../EugWeb/admin/views/admin', {
                namePathEnableds: namePathEnableds
            });
        } else {
            res.status(404);
            res.redirect("/");
        }
    })
    io.of('/admin').use(function(socket, next){
        if(socket.request.session.admin) {
            next();
        } else {
            next(new Error("Not Authorized"));
        }  
    }).on('connection', (socket) => {
        this.eugEmitter.on("serverStateChanged", ()=>{
            socket.emit('serverStateChanged', serverState);
        })
        socket.on("serverStateChanged", (data)=>{
            socket.emit('serverStateChanged', serverState);
        })
        socket.on("setsvar", (data)=>{
            var property = data.property;
            var value = data.value;
            function reCalculateAutoLaunchCond(valueNbMinPlayer, valueNbMaxPlayer){
                var tempNbMinPlayer = parseInt(valueNbMinPlayer);
                var tempAutoLaunchCond = tempNbMinPlayer - valueNbMaxPlayer;
                switch(tempAutoLaunchCond) {
                    case 1:
                    case 0:
                    case -1:
                        serverState.AutoLaunchCond = tempAutoLaunchCond;
                        return tempNbMinPlayer;
                    default:
                        if(tempAutoLaunchCond>1){
                            serverState.AutoLaunchCond = 1;
                            eugRCON.setsvar(property, valueNbMaxPlayer + 1);
                            return tempNbMinPlayer + 1;
                        } else {
                            serverState.AutoLaunchCond = -2;
                            return tempNbMinPlayer;
                        }
                }
            }
            switch(property){
                case "NbMaxPlayer":
                    var receivedNbMaxPlayer = parseInt(value);
                    var InitMoney = receivedNbMaxPlayer/2*1000;
                    var ScoreLimit = serverState.VictoryCond === 4 ? 500 : InitMoney*2;
                    eugRCON.setsvar("InitMoney", InitMoney);
                    eugRCON.setsvar("ScoreLimit", ScoreLimit);
                    switch(serverState.AutoLaunchCond){
                        case 1:
                        case 0:
                        case -1:
                            eugRCON.setsvar(property, value);
                            eugRCON.setsvar("NbMinPlayer", receivedNbMaxPlayer + serverState.AutoLaunchCond);
                            break;
                        case -2:
                            var prevNbMaxPlayer = serverState.NbMaxPlayer;
                            eugRCON.setsvar(property, value);
                            reCalculateAutoLaunchCond(serverState.NbMinPlayer, prevNbMaxPlayer);
                            break;
                        default:
                            throw Error("serverState.AutoLaunchCond is not in range [-2...1]")
                    }
                    break;
                case "NbMinPlayer":
                    eugRCON.setsvar(property, reCalculateAutoLaunchCond(value, serverState.NbMaxPlayer));
                    break;
                case "AutoLaunchCond":
                    var receivedAutoLaunchCond = parseInt(value);
                    switch(receivedAutoLaunchCond){
                        case -1:
                        case 0:
                        case 1:
                            eugRCON.setsvar("NbMinPlayer", serverState.NbMaxPlayer + receivedAutoLaunchCond);
                        case -2:
                            serverState.AutoLaunchCond = receivedAutoLaunchCond;
                            break;
                    }
                    break;
                case "VictoryCond":
                    var receivedVictoryCond = parseInt(value);
                    var InitMoney = serverState.NbMaxPlayer/2*1000;
                    var ScoreLimit = receivedVictoryCond === 4 ? 500 : InitMoney*2;
                    eugRCON.setsvar("VictoryCond", receivedVictoryCond)
                    eugRCON.setsvar("InitMoney", InitMoney)
                    eugRCON.setsvar("ScoreLimit", ScoreLimit)
                default:
                    eugRCON.setsvar(property, value);
            }
            // eugRCON.setsvar(property, value);
        })
        socket.on("setpvar", (data)=>{
            var playerid = data.playerid;
            var property = data.property;
            var value = data.value;
            eugRCON.setpvar(playerid, property, value);
        })
        socket.on("kick", (data)=>{
            var playerid = data.playerid;
            eugRCON.kick(playerid);
        })
        socket.on("ban", (data)=>{
            var playerid = data.playerid;
            eugRCON.ban(playerid);
        })
        socket.on("command", (data)=>{
            var command = data.command;
            eugRCON.command(command);
        })
        socket.on('disconnect', function() {})
    })

    router.get('/', (req, res) => {
        res.render('../EugWeb/public/views/public', {
            namePathEnableds: namePathEnableds
        });
    })
    io.on('connection', (socket) =>  {
        this.eugEmitter.on("serverStateChanged", ()=>{
            socket.emit('serverStateChanged', serverState);
        });

        socket.on("serverStateChanged", ()=>{
            socket.emit('serverStateChanged', serverState);
        })
        socket.on('disconnect', function() {})
    })



    return router;
}