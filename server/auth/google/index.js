'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');

var router = express.Router();

router
  .get('/', passport.authenticate('google', {
    failureRedirect: '/login/failure',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    session: false
  }))

  .get('/callback', passport.authenticate('google', {
    failWithError: true,
    //failureRedirect: '/login/failure',
    session: false
  }), auth.setTokenCookie, function(err, req, res, next){

    if(err && err.isInActive){
      res.cookie('error_msg', {value : "Your account is not activated!"});
    }

    res.redirect("/login/failure")
  });

module.exports = router;
