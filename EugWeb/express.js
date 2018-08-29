module.exports = function() {
  const express = require('express');
  const session = require('express-session');
  const bodyParser = require('body-parser');
  const SERVER_CONFIG = require('../server-config.json');

  var app = express();
  app.set('views','./modules');
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
