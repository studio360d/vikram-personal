'use strict';

var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/environment');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var compose = require('composable-middleware');
var User = require('../api/user/user.model');
var UserRole = require('../api/userrole/userrole.model');
var Customer = require('../api/customer/customer.model');
var Vendor = require('../api/vendor/vendor.model');
var validateJwt = expressJwt({secret: config.secrets.session});
var CONSTANTS = require('../api/constant/constants');
var UserRoleTypesConst = CONSTANTS.UserRoleTypes;
var vendorRoleID = UserRoleTypesConst.VENDOR.roleId;
var vendorUserRoleID = UserRoleTypesConst.VENDOR_USER.roleId;
var customerRoleID = UserRoleTypesConst.CUSTOMER.roleId;
var adminRoleID = UserRoleTypesConst.ADMIN.roleId;
var UnauthorizedError = require('./UnauthorizedError');

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated() {
  return compose()
    // Validate jwt
    .use(function (req, res, next) {
      // allow access_token to be passed through query parameter as well
      if (req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = 'Bearer ' + req.query.access_token;
      }
      validateJwt(req, res, next);
    })
    // Attach user to request
    .use(function (req, res, next) {
      User.findById(req.user._id, function (err, user) {
        if (err) return next(err);
        if (!user) return res.status(401).send('Unauthorized');

        req.user = user;
        next();


      });
    });
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasRole(roleRequired) {
  if (!roleRequired) throw new Error('Required role needs to be set');

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      if (config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
        next();
      }
      else {
        res.status(403).send('Forbidden');
      }
    });
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(id) {
  return jwt.sign({_id: id}, config.secrets.session, {expiresIn: "1d"});
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {
  if (!req.user) return res.status(404).json({message: 'Something went wrong, please try again.'});
  if(req.user.isNew){
   return  res.redirect('/customer/register/success');
  }
  var token = signToken(req.user._id, req.user.role);
  res.cookie('token', JSON.stringify(token));
  res.redirect('/dashboard/myOrders');
}

// check user  having vendor role
function checkValidUser(user, callback) {

  UserRole.findOne({userId: user._id}, function (err, userRole) {

    if (err) return callback(err);

    if (!userRole) return callback({message: "User role not defined for this user"});

    var roleId = userRole.roleId;

    if (isAdmin(userRole)) return callback(err, {userRole: userRole});


    //if customer

    if (isCustomer(userRole)) {

      Customer.findOne({userId: user._id}, function (err, customer) {

        if (err) return callback(err);


        if (!customer) return callback({message: "Not a valid customer"});


        callback(err, {userRole: userRole, customer: customer});

      });

      return;

    }


    return callback({message: "Invalid User"});


  });


}


// check user  having vendor role
function checkValidVendor(user, callback) {


  UserRole.findOne({userId: user._id}, function (err, userRole) {

    if (err) return callback(err);

    if (!userRole) return callback({message: "User role not defined for this user"});

    var roleId = userRole.roleId;

    if (!isVendor(userRole)) return callback({message: "Invalid vendor!"});


    Vendor.findOne({userId: user._id}).populate('vendorRegistrationId').exec(function (err, vendor) {

      if (err) return callback(err);


      if (!vendor) return callback({message: "Not a valid vendor"});


      callback(err, {userRole: userRole, vendor: vendor});

    });


  });


}


function isAdminByMiddleware(req, res, next) {

  var userRole = req.user && req.user.roles[0];

  if (userRole && isAdmin(userRole)) return next();


  next(new UnauthorizedError( 'unauthorized', { message: 'User is not admin' }))

}


function isAdmin(userRole) {

  if (userRole.roleId == adminRoleID) return true;

  return false;

}


function isVendorByMiddleware(req, res, next) {

  var userRole = req.user.roles[0];

  if (isVendor(userRole)) return next();


  next(new Error('User is not Vendor'))

}


function isVendor(userRole) {


  if (userRole.roleId == vendorRoleID) return true;


  return false;

}


function isVendorUser(userRole) {


  if (userRole.roleId == vendorUserRoleID) return true;


  return false;

}


function isCustomerByMiddleware(req, res, next) {

  var userRole = req.user.roles[0];

  if (isCustomer(userRole)) return next();


  next(new Error('User is not Customer'))

}


function isCustomer(userRole) {

  if (userRole.roleId == customerRoleID) return true;

  return false;

}

function checkEmailInVendorRegistration(email, callback) {
  var VendorRegistration = mongoose.model("VendorRegistration");

  VendorRegistration.findOne({email: email}, function (err, vendorRegistation) {


    if (err) return callback(err);

    //email alredy exist
    if (vendorRegistation) return callback({message: "Email id already exist in vendor registaration"})

    callback();
  });

}

exports.isAuthenticated = isAuthenticated;
exports.hasRole = hasRole;
exports.signToken = signToken;
exports.setTokenCookie = setTokenCookie;
exports.checkValidUser = checkValidUser;
exports.checkValidVendor = checkValidVendor;
exports.isAdmin = isAdmin;
exports.isVendor = isVendor;
exports.isCustomer = isCustomer;
exports.isAdminByMiddleware = isAdminByMiddleware;
exports.isCustomerByMiddleware = isCustomerByMiddleware;
exports.isVendorByMiddleware = isVendorByMiddleware;
exports.checkEmailInVendorRegistration = checkEmailInVendorRegistration;


