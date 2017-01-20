/**
 * Express configuration
 */

'use strict';

var express = require('express');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var path = require('path');
var multer = require('multer');
var config = require('./environment');
var passport = require('passport');

module.exports = function(app) {
  var env = app.get('env');

  app.set('views', config.root + '/server/views');
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');

  if(process.env.preRenderEnabled == 'YES'){

    app.use(require('prerender-node')
      .set('prerenderToken', 'lHKiBpsD4Xzs0SXxipsU'));

    app.use(require('prerender-node').set('beforeRender', function(req, done) {
      // do whatever you need to do
      console.log("Before rendering : " + req.url);
      done();
    }));

    app.use(require('prerender-node').set('afterRender', function(err, req, prerender_res) {
      // do whatever you need to do
      console.log("After rendering : " + req.url);
    }));
  }
  app.use(compression());
  app.use( multer( { dest: 'temp-uploads/' } ) );
  app.use(bodyParser.urlencoded({ extended: false, limit: '5mb' }));
  app.use(bodyParser.json({limit: '5mb'}));
  app.use(methodOverride());
  app.use(cookieParser());
  app.use(passport.initialize());
  if ('production' === env) {
    app.use(favicon(path.join(config.root, 'public', 'favicon.ico')));
    app.use(express.static(path.join(config.root, 'public')));
    app.set('appPath', path.join(config.root, 'public'));
    app.use(morgan('dev'));
  }

  if ('development' === env || 'test' === env) {
    app.use(require('connect-livereload')());
    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'client')));
    app.set('appPath', path.join(config.root, 'client'));
    app.use(morgan('dev'));
    app.use(errorHandler()); // Error handler - has to be last
  }
};
