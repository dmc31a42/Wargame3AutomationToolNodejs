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
            eugRCON.setsvar(property, value);
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