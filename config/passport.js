
var mongoose = require('mongoose')
  , LocalStrategy = require('passport-local').Strategy
  , TwitterStrategy = require('passport-twitter').Strategy
  , User = mongoose.model('User')
  , OAuthStrategy = require('passport-oauth').OAuthStrategy;


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
  var webrtcStrategy = new OAuthStrategy({
         requestTokenURL: 'http://oauth.comcastlabs.com:3002/oauth/request_token'
      ,  accessTokenURL: 'http://oauth.comcastlabs.com:3002/oauth/access_token'
      ,  userAuthorizationURL: 'http://oauth.comcastlabs.com:3002/dialog/authorize'
      ,  consumerKey: config.webrtcgw.consumerKey
      ,  consumerSecret: config.webrtcgw.consumerSecret
      ,  callbackURL: config.webrtcgw.callbackURL
    },
    function(token, tokenSecret, profile, done) {
      console.log('successfully logged token');
      console.log('token = ' + token);
      console.log('tokenSecret = ' + tokenSecret);
      console.log('Profile  = ');
      console.log(profile);
      return done(null,profile);
    }
  );
  webrtcStrategy.userProfile = function(token, tokenSecret, params, done) {
  console.log('loading webrtc profile ');
  console.log(params);
  this._oauth.get('http://oauth.comcastlabs.com:3002/api/userinfo', token, tokenSecret, function(err, body, res){
    if (err) { return done(new InternalOAuthError('failed to fetch user profile', err));}

    try {
      var json = JSON.parse(body);

      var profile = {provider: 'webrtcgw'};
      profile.id = json.user_id;
      profile.name = json.name;
      profile.phoneNumber = json.phoneNumber;
      profile.token = { kind: 'oauth', token: token, attributes: { tokenSecret: tokenSecret}};
  return done(null, profile);
    } catch(e){
      done(e);
    }
  });
  
  }

  passport.use('webrtcgw-authz',webrtcStrategy);

}
