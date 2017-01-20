var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var UserService = require('../../api/user/user.service')
var Auth = require('../../auth/auth.service');
exports.setup = function (User, config) {
  passport.use(new FacebookStrategy({
      passReqToCallback: true,
      clientID: config.facebook.clientID,
      clientSecret: config.facebook.clientSecret,
      callbackURL: config.facebook.callbackURL,
      profileFields: ["emails", "displayName", "name"]
    },
    function (req,accessToken, refreshToken, profile, done) {
      User.findOne({
          'facebook.id': profile.id
        },
        function (err, user) {
          if (err) {
            return done(err);
          }


          if (!user) {

            Auth.checkEmailInVendorRegistration(profile.emails[0].value, function (err) {

              if (err) return done(null);

              user = new User({
                isActive : true,
                name: profile.displayName,
                email: profile.emails[0].value,
                role: 'user',
                username: profile._json.name,
                provider: 'facebook',
                facebook: profile._json
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
        })
    }
  ));
};


