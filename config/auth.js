const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
let User = require('../models/user');


module.exports = (passport) => {
    passport.use(new GoogleStrategy({
        clientID: "750025970676-l6l9odsscceuon7jhrlg1o13juofag4v.apps.googleusercontent.com",
        clientSecret: "Gjd_dHLKarvZ5pIVOkakbteS",
        callbackURL: "http://localhost:3010/auth/google/callback"
      },
      function(accessToken, refreshToken, profile, done) {
          console.log(profile.displayName);
          console.log(profile.emails[0].value);
          console.log(profile.id);
           User.findOrCreate({ name: profile.displayName,
            email: profile.emails[0].value,
            //regno: 12345678,
            password: profile.id }, function (err, user) {
             return done(err, user);
           });
      }
    ));
};