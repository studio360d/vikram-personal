/**
 * Created by HP on Jun-08-15.
 */
var jwt = require( 'jsonwebtoken' );
var config = require( '../config/environment' );
var async = require( 'async' );
var _ = require( 'lodash' );
var User = require( '../api/user/user.model' );
var Vendor = require( '../api/vendor/vendor.model' );
var UserRoles = require( '../api/userrole/userrole.model' );
var Customer = require( '../api/customer/customer.model' );
var mongoose = require( 'mongoose' );
var UnauthorizedError = require('./UnauthorizedError');
var CONSTANTS = require('../api/constant/constants');
var Auth = require('./auth.service');


exports.getLoggedUser = function( req, res, next ) {

  if ( req.user ) {
    return next();
  }
  var token;
  if ( req.headers && req.headers.authorization ) {
    var parts = req.headers.authorization.split( ' ' );
    if ( parts.length == 2 ) {
      var scheme = parts[ 0 ]
        , credentials = parts[ 1 ];

      if ( /^Bearer$/i.test( scheme ) ) {
        token = credentials;
      }
    }
  }

  if ( !token ) {
    return next();
  }

  var secret = config.secrets.session;

  jwt.verify( token, secret, {}, function( err, decoded ) {

    if ( err ) {return next( new UnauthorizedError( 'credentials_required', { message: 'No authorization token was found' }) );}

    async.waterfall( [

      getFindUserIdFunc( req, decoded ),

      getFindUserRolesFunc( req ),

      getFindVendorFunc(req),


      function findCustomer(user, next){

        Customer.findOne({userId : user._id}, function(err, customer){

          if ( err ) {return next(err);}

          req.user.customerId = customer && customer._id;

          next(err);
        });

      }


    ], function done( err, result ) {

      if ( err ) {
        return next( err );
      }

      next();

    });


  });
};


function getFindUserIdFunc( req, decoded ) {

  return function( callback ) {

    User.findById( decoded._id ).exec( function( err, user ) {

      if ( err || !user ) {return callback( new Error( 'Invalid User' ) );}

      req.user = user.toObject();

      callback( null, user );
    } );
  }
}


function getFindUserRolesFunc( req ) {

  return function( user, callback ) {
    UserRoles.find( { userId: user._id } )
      .select( "roleId" )
      .exec( function( err, userRoles ) {

        if ( err ) { return callback( new Error( 'User not fount in User Mangement' ) );}

        req.user.roles = userRoles;

        callback( null, req.user );

      } );

  }


}


function getFindVendorFunc( req ) {

  return function( user, callback ) {

    var userRole = user.roles[0];

    if (Auth.isAdmin(userRole) || Auth.isCustomer(userRole)) return callback(null, req.user);

    Vendor.findOne({userId: user._id})
      .exec(function (err, vendor) {

        if (err) {
          return callback(new Error('Vendor not found'));
        }

        req.user.vendorId = vendor && vendor._id;

        req.user.vendorShortCode = vendor && vendor.shortCode;

        callback(null, req.user);

      });



  }


}


