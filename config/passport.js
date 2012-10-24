
var mongoose = require('mongoose')
  , LocalStrategy = require('passport-local').Strategy
  , TwitterStrategy = require('passport-twitter').Strategy
  , User = mongoose.model('User')
  , WebrtcGWStrategy = require('passport-oauth').OAuth2Strategy;


exports.boot = function (passport, config) {
  // require('./initializer')

  // serialize sessions
  passport.serializeUser(function(user, done) {
    console.log('serializing user');
    done(null, user.id)
  })

  passport.deserializeUser(function(id, done) {
    User.findOne({ _id: id }, function (err, user) {
      done(err, user)
    })
  })

  // use local strategy
  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    },
    function(email, password, done) {
      User.findOne({ email: email }, function (err, user) {
        if (err) { return done(err) }
        if (!user) {
          return done(null, false, { message: 'Unknown user' })
        }
        if (!user.authenticate(password)) {
          return done(null, false, { message: 'Invalid password' })
        }
        return done(null, user)
      })
    }
  ))

  // use twitter strategy
  passport.use(new TwitterStrategy({
        consumerKey: config.twitter.consumerKey
      , consumerSecret: config.twitter.consumerSecret
      , callbackURL: config.twitter.callbackURL
    },
    function(token, tokenSecret, profile, done) {
      User.findOne({ 'twitter.id': profile.id }, function (err, user) {
        if (err) { return done(err) }
        if (!user) {
          user = new User({
              name: profile.displayName
            , username: profile.username
            , provider: 'twitter'
            , twitter: profile._json
          })
          user.save(function (err, user) {
            if (err) console.log(err)
            return done(err, user)
          })
        }
        else {
          return done(err, user)
        }
      })
    }
  ))
  passport.use('webrtcgw-authz', new WebrtcGWStrategy({
         tokenURL: 'http://10.255.132.197:3002/oauth/token'
      ,  authorizationURL: 'http://10.255.132.197:3002/dialog/authorize'
      ,  clientID: config.webrtcgw.consumerKey
      , clientSecret: config.webrtcgw.consumerSecret
      , callbackURL: config.webrtcgw.callbackURL
    },
    function(token, tokenSecret, profile, done) {
      console.log(token, tokenSecret, profile);
    }
  ))


}
