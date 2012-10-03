var mongoose = require('mongoose')
	, _ = require('underscore')
  , User = mongoose.model('User')
  , shrt = require('short')

shrt.connect('mongodb://localhost/webrtc-me');
shrt.connection.on('error', function(error){
  throw new Error(error);
});

exports.signin = function (req, res) {}

// auth callback
exports.authCallback = function (req, res, next) {
  res.redirect('/')
}

// login
exports.login = function (req, res) {
  res.render('users/login', {
    title: 'Login'
  })
}

// sign up
exports.signup = function (req, res) {
  res.render('users/signup', {
    title: 'Sign up'
  })
}

// logout
exports.logout = function (req, res) {
  req.logout()
  res.redirect('/login')
}

// session
exports.session = function (req, res) {
  res.redirect('/')
}

// signup
exports.create = function (req, res) {
  var user = new User(req.body)
  user.provider = 'local'
  user.save(function (err) {
    if (err) return res.render('users/signup', { errors: err.errors })
    req.logIn(user, function(err) {
      if (err) return next(err)
      return res.redirect('/')
    })
  })
}

exports.update = function(req, res){
  var user = req.user;
  if (req.body.chatUrl == ''){
    shrt.generate(user.id, function(error, shrtObj) {
      req.body.chatUrl = shrtObj.hash;
      user = _.extend(user, req.body)
      user.save(function(err, doc) {
        if (err) {
        res.render('users/show', {
            title: 'Edit User'
          , user: user
          , errors: err.errors
         })
        }
        else {
          res.redirect('/users/'+user._id)
        }
      })

    });
  }else {
  user = _.extend(user, req.body)
  user.save(function(err, doc) {
    if (err) {
      res.render('users/show', {
          title: 'Edit User'
        , user: user
        , errors: err.errors
      })
    }
    else {
      res.redirect('/users/'+user._id)
    }
  })
  }
}

// show profile
exports.show = function (req, res) {
  console.log(req.profile.twitter)
  var user = req.profile
  res.render('users/show', {
      title: user.name
    , user: user
  })
}
