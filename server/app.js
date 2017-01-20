/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');
var device = require('express-device');
// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function (err) {
    console.error('MongoDB connection error: ' + err);
    process.exit(-1);
  }
);

var db = mongoose.connection;
db.open('on', function () {

// Populate DB with sample data
  if (config.seedDB) {
    require('./config/seed');
  }

});

// Setup server
var app = express();

//this helps us to detect the requested device...
app.use(device.capture());
device.enableDeviceHelpers(app);

//app.use(require('express-domain-middleware')); //TODO uncomment  while production
var server = require('http').createServer(app);
require('./config/express')(app);//adding config properties to app
require('./routes')(app); //adding routes

if(process.env.NODE_ENV == "production") redirectNonHttp(app);

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;

//http://stackoverflow.com/questions/8605720/how-to-force-ssl-https-in-express-js
//http://stackoverflow.com/questions/7185074/heroku-nodejs-http-to-https-ssl-forced-redirect
function redirectNonHttp(app){

  // redirect non https url to https url
  app.get('*' , function (req , res , next) {

    if (req.headers['x-forwarded-proto'] != 'https'){

      res.redirect('https://' + req.headers.host + req.url);

    }else{
      /* Continue to other routes if we're not redirecting */
      next();
    }
  });
}
