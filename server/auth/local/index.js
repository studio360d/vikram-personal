'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');
var Customer = require('../../api/customer/customer.model');
var Vendor = require('../../api/vendor/vendor.model');
var InternalStudent = require('../../api/internalcustomer/internalcustomer.model');
var AttachmentModel = require('../../api/attachment/attachment.model');
var UserModel = require('../../api/user/user.model');
var UserRole = require('../../api/userrole/userrole.model');
var _ = require('lodash');
var async = require('async');
var router = express.Router();

// login customer

router.post('/', function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    var error = err || info;
    if (error) return res.status(500).json(error);
    if (!user) return res.status(404).json({message: 'Something went wrong, please try again.'});
    if (!user.isActive) return res.status(404).json({message: 'Your Account is Not Active. please contact support.'});

    auth.checkValidUser(user, function (err, userInfo) {

      if (err) return res.status(401).json(err);

      var token = auth.signToken(user._id);

      userInfo.token = token;

      res.status(200).json(userInfo);

    });

  })(req, res, next)
});

// login vendor

router.post('/vendor', function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    var error = err || info;
    if (error) return res.status(500).json(error);
    if (!user) return res.status(404).json({message: 'Oops!!.. Something went wrong, please try again.'});
    if (!user.isActive) return res.status(404).json({message: 'Oops!!... Something went wrong. Contact support team for resolution. Regret the inconvenience.'});

    auth.checkValidVendor(user, function (err, userInfo) {

      if (err) return res.status(500).json(err);

      var token = auth.signToken(user._id);

      userInfo.token = token;

      res.status(200).json(userInfo);

    });

  })(req, res, next)
});


/**
 * authenticate internal customer by student id and password
 * 1. check student id in customer  table, if student id not there, throw error  'student id not found'
 * 2. find user  in user table validate user is active and password
 * 3. check customer in internal student, if not, throw 'invalid internal student'
 * 4. call checkvalid user, get user role and customer info
 */
router.post('/internalstudent', function (req, res) {

  var studentId = req.body.studentId;
  var password = req.body.password;

  var customerInfo;
  var userObj;
  var userInfo;
  var internalCustomerInfo;
  async.series([

    //find customer by student id
    function (next) {

      Customer.findOne({uniqueCode: studentId}, function (err, doc) {

        if (err) return next(err);

        if (!doc) return next({message: 'Invalid Student id!'});

        customerInfo = doc;

        next(err);

      });
    },

    //check customer is valid internal customer
    function (next) {

      InternalStudent.findByCustomerWithDetails(customerInfo._id, function (err, doc) {

        if (err) return next(err);

        if (!doc) return next({message: "Invalid Internal Student!"});

        if (doc.disabled) return next({message: 'Your Account is deactivated.please contact support.'});

        internalCustomerInfo = doc;

        next();
      });


    },

    //find user
    function (next) {

      UserModel.findById(customerInfo.userId, function (err, user) {

        if (err) return next(err);
        if (!user) return next({message: 'Something went wrong, please try again.'});
        if (!user.authenticate(password)) {
          return next({message: 'This password is not correct.'});
        }

        userObj = user;

        next(err);

      });


    },

    function (next) {


      auth.checkValidUser(userObj, function (err, _userInfo) {

        if (err) return next(err);

        userInfo = _userInfo;

        userInfo.token = auth.signToken(userObj._id);

        userInfo.internalCustomer = internalCustomerInfo;

        next(err);

      });
    }


  ], function (err) {

    if (err) return res.status(500).json(err);


    res.status(200).json(userInfo);

  });

});


module.exports = router;
