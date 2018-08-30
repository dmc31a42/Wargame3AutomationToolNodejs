const express = require('express');

class EugWeb {
  constructor(servicePort, serverState, eugEmitter, eugRCON, importedModules){
    this.servicePort = servicePort;
    this.serverState = serverState;
    this.eugEmitter = eugEmitter;
    this.eugRCON = eugRCON;
    this.importedModules = importedModules;

    var app = require('./EugWeb/express')();
    const server = require('http').createServer(app);
    var io = require('socket.io')(server);

    app.use('/admin', function(req, res, next){
      // if(!req.isAdmin) {
      //   res.status(404);
      //   res.redirect(req.path);
      // } else {
      //   next();
      // }
      next();
    })
    app.use('/admin/css', express.static('./EugWeb/admin/css'));
    app.use('/admin/js', express.static('./EugWeb/admin/js'));
    app.use('/admin/images', express.static('./EugWeb/admin/images'));
    app.use('/css', express.static('./EugWeb/public/css'));
    app.use('/js', express.static('./EugWeb/public/js'));
    app.use('/images', express.static('./EugWeb/public/images'));
    var mainRouter = require('./EugWeb/router')(serverState, eugEmitter, eugRCON, importedModules, io);
    app.use('/', mainRouter);



    importedModules.forEach((importedModule)=>{
      var path = importedModule.moduleInfo.path;
      app.use('/admin/' + path, importedModule.adminRouter(io.of('/admin:' + path)))
      app.use('/' + path, importedModule.publicRouter(io.of('/public:' + path)))
    })

    
    server.listen(servicePort, function() {
      console.log('Express & Socket IO server listening on port ' + servicePort);
    })
  }
}

module.exports = function(servicePort, serverState, eugEmitter, eugRCON, importedModules) {
  return new EugWeb(servicePort, serverState, eugEmitter, eugRCON, importedModules);
}