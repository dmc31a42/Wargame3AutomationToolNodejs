const express = require('express');
const EugServerState = require('./EugServerState')
const EventEmitter = require('events')
class EugEmitter extends EventEmitter {}
const EugRCON = require('./EugRCON');
const BtwProxyAndServiceModule = require('./BtwProxyAndServiceModule')
/**
 * @class
 */
class EugWeb {
  /**
   * 
   * @param {number} servicePort 
   * @param {EugServerState} serverState 
   * @param {EugEmitter} eugEmitter 
   * @param {EugRCON} eugRCON
   * @param {BtwProxyAndServiceModule[]} importedModules 
   */
  constructor(servicePort, serverState, eugEmitter, eugRCON, importedModules){
    /**@type {number} */
    this.servicePort = servicePort;
    /**@type {EugServerState} */
    this.serverState = serverState;
    /**@type {EugEmitter} */
    this.eugEmitter = eugEmitter;
    /**@type {EugRCON} */
    this.eugRCON = eugRCON;
    /**@type {BtwProxyAndServiceModule[]} */
    this.importedModules = importedModules;


    const express = require('express');
    const session = require('express-session');
    const bodyParser = require('body-parser');
    const SERVER_CONFIG = require('./server-config.json');

    var app = express();
    app.set('views','./modules');
    app.set('view engine', 'jade');
    app.use(bodyParser.urlencoded({ extended: false }));
    const sessionMiddleware = session({
      secret: SERVER_CONFIG.SESSION.secret,
      resave: false,
      saveUninitialized: true
    });
    app.use(sessionMiddleware);
    app.locals.pretty = true;


    // var app = require('./EugWeb/express')();
    const server = require('http').createServer(app);
    var io = require('socket.io')(server);
    io.use(function(socket, next){
      sessionMiddleware(socket.request, socket.request.res, next);
    })
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
    app.use('/admin/*', (req, res, next)=>{
      if(req.session.admin){
        next();
      } else {
        res.redirect("/");
      }
    })

    importedModules.forEach((importedModule)=>{
      var path = importedModule.moduleInfo.path;
      app.use('/admin/' + path, importedModule.adminRouter(io.of('/admin:' + path).use(function(socket, next){
        if(socket.request.session.admin){
          next();
        } else {
          next(new Error("Not Authorized"));
        }
      })))
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