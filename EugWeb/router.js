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

    router.get('/admin', (req, res) => {
        res.render('../EugWeb/admin/views/admin', {
            namePathEnableds: namePathEnableds
        });
    })
    io.of('/admin').on('connection', (socket) => {
        this.eugEmitter.on("serverStateChanged", ()=>{
            socket.emit('serverStateChanged', serverState);
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
        socket.on('disconnect', function() {})
    })



    return router;
}