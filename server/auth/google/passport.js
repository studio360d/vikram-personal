var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var UserService = require('../../api/user/user.service');
var Auth = require('../../auth/auth.service');
exports.setup = function (User, config) {
  passport.use(new GoogleStrategy({
       passReqToCallback: true,
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL
    },
    function (req,accessToken, refreshToken, profile, done) {
      User.findOne({
        'google.id': profile.id
      }, function (err, user) {
        if (!user) {
          Auth.checkEmailInVendorRegistration(profile.emails[0].value, function (err) {

            if (err) return done(null);// email already exists, throw error

            user = new User({
              isActive : true,
              name: profile.displayName,
              email: profile.emails[0].value,
              role: 'user',
              username: profile.username,
              provider: 'google',
              google: profile._json
            });
            user.save(function (err, savedUser) {
              if (err) return done(null);
              UserService.createCustomerInfo(savedUser, function (err) {
                user.isNew = true;
                done(err, user);
              });


            });
          });
        } else {

          //check user is not  active, throw error
          if(!user.isActive){

            return done({isInActive:true});
          }

          return done(err, user);
        }
      });
    }
  ));
};
