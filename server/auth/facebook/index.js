'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');

var router = express.Router();

router
  .get('/', passport.authenticate('facebook', {
    scope: ['email', 'user_about_me'],
    failureRedirect: '/login/failure',
    session: false
  }))

  .get('/callback', passport.authenticate('facebook', {
    failureRedirect: '/login/failure',
    session: false
  }), auth.setTokenCookie,function(err, req, res, next){

    if(err && err.isInActive){
      res.cookie('error_msg', {value : "Your account is not activated!"});
    }

    res.redirect("/login/failure")
  });;

module.exports = router;
