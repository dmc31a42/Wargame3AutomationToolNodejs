module.exports = function(servicePort) {
  const express = require('express');
  const session = require('express-session');
  const bodyParser = require('body-parser');
  const SERVER_CONFIG = require('./config.json');

  var app = express();
  //app.set('views','./views/MongoDB');
  app.set('view engine', 'jade');
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(session({
    secret: SERVER_CONFIG.SESSION.secret,
    resave: false,
    saveUninitialized: true
  }));
  app.locals.pretty = true;

  return app;
}