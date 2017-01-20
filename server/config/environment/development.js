'use strict';
module.exports = {
  // MongoDB connection options
  mongo: {

    uri: 'mongodb://localhost/vikram-dev'

    //uri: 'mongodb://192.168.0.7/redbricks-dev'
    //uri: 'mongodb://localhost:4321/test'
  },

  seedDB: true,
  enableS3Upload: true,
  hostname: 'http://localhost:3000'
};
