'use strict';
var URL = require('url-parse');

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip:       process.env.OPENSHIFT_NODEJS_IP ||
            process.env.IP ||
            undefined,

  // Server port
  port:     process.env.OPENSHIFT_NODEJS_PORT ||
            process.env.PORT ||
            80,

  // MongoDB connection options
  mongo: {
    uri:
      'mongodb://admin:admin1234@ds111589.mlab.com:11589/redbricks-prod'
  },

  hostname: process.env.HOST_NAME

};
