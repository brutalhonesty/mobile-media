'use strict';

var express = require('express'),
    favicon = require('static-favicon'),
    morgan = require('morgan'),
    compression = require('compression'),
    bodyParser = require('body-parser'),
    multiparty = require('multiparty'),
    format = require('util').format,
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    errorHandler = require('errorhandler'),
    path = require('path'),
    config = require('./config');

/**
 * Express configuration
 */
module.exports = function(app) {
  var env = app.get('env');

  if ('development' === env) {
    app.use(require('connect-livereload')());

    // Disable caching of scripts for easier testing
    app.use(function noCache(req, res, next) {
      if (req.url.indexOf('/scripts/') === 0) {
        res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.header('Pragma', 'no-cache');
        res.header('Expires', 0);
      }
      next();
    });

    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'app')));
    app.set('views', config.root + '/app/views');
  }

  if ('production' === env) {
    app.use(compression());
    app.use(favicon(path.join(config.root, 'public', 'favicon.ico')));
    app.use(express.static(path.join(config.root, 'public')));
    app.set('views', config.root + '/views');
  }

  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
  app.use(morgan('dev'));
  app.set('uploadDir', path.join(config.root, 'uploads'));
  app.set('uploadRelative', 'uploads');
  app.use(function (req, res, next) {
    req.uploadDir = app.get('uploadDir');
    req.uploadRelative = app.get('uploadRelative');
    if(req.method === 'POST' && req.headers['content-type'].indexOf("multipart/form-data") !== -1){
      var form = new multiparty.Form();
      form.parse(req, function(err, fields, files){
        req.files = files;
        next();
      });
    } else {
      next();
    }
  });
  app.use(bodyParser({ keepExtensions: true, uploadDir: app.get('uploadDir') }));
  app.use(methodOverride());

  // Error handler - has to be last
  if ('development' === app.get('env')) {
    app.use(errorHandler());
  }
};