(function () {
  var passport = require('passport')
    , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
    , RememberMeStrategy = require('passport-remember-me').Strategy
    , _ = require('underscore')
    , Users = require('./users.js')
    , Config = require('./../_config.json')
    , app = require('./../server.js').app;

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(passport.authenticate('remember-me'));

  passport.use(new GoogleStrategy({
      clientID: '231761169549-j0ruk7pr12eqsdqbivrvoc5a29o29s55.apps.googleusercontent.com',
      clientSecret: 'eK4lxm-VGUUD1xCwexTKGbJo',
      callbackURL: Config.me + 'api/auth/google/callback'
    },
    function(accessToken, refreshToken, profile, done) {
      var _user = Users.getByEmail(profile.emails[0].value);
      if (!_user) return done(null, false);
      // if (profile.emails[0].value !== Config.whoami) return done(null, false);
      return done(null , _user);
    }
  ));

  passport.use(new RememberMeStrategy(function(token, done) {
      var _user = Users.getById(token)
      if (!_user) return done(null, false);
      return done(null, _user);
    },
    function(user, done) {
      return done(null, user.id);
    }
  ));

  passport.serializeUser(function(user, done) {
    done(null, JSON.stringify(user));
  });
  passport.deserializeUser(function(user, done) {
    done(null, JSON.parse(user));
  });


  app.get('/api/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'] }));
  app.get('/api/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), function(req, res) {
    res.cookie('remember_me', req.user.id , { path: '/', httpOnly: true, maxAge: 604800000 }); // 7 days
    // console.log('req.user', req.user);
    res.redirect('/'); 
  });

  module.exports = {
  }
}());