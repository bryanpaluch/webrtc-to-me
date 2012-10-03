
var mongoose = require('mongoose')
  , Member = mongoose.model('Member')
  , User = mongoose.model('User')
  , async = require('async')

module.exports = function (app, passport, auth) {
	// conference routes
  var chat = require('../app/controllers/chat')
	app.get('/chat', auth.requiresLogin, chat.show);	
  app.get('/c/:hash', auth.requiresLogin, chat.showHash);
  // user routes
  var users = require('../app/controllers/users')
  app.get('/login', users.login)
  app.get('/signup', users.signup)
  app.get('/logout', users.logout)
  app.post('/users', users.create)
  app.post('/users/session', passport.authenticate('local', {failureRedirect: '/login'}), users.session)
  app.get('/users/:userId', users.show)
  app.put('/users/:userId', users.update);
  app.get('/auth/twitter', passport.authenticate('twitter', { failureRedirect: '/login' }), users.signin)
  app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), users.authCallback)
  app.param('userId', function (req, res, next, id) {
    User
      .findOne({ _id : id })
      .exec(function (err, user) {
        if (err) return next(err)
        if (!user) return next(new Error('Failed to load User ' + id))
        req.profile = user
        next()
      })
  })
	// member routes
  var members = require('../app/controllers/members')
	app.get('/members', auth.requiresLogin, members.index )
  app.get('/members/add', auth.requiresLogin, members.add)
  app.post('/members', auth.requiresLogin, members.create)
  app.get('/members/:id', auth.requiresLogin, auth.member.hasAuthorization, members.show)
  app.put('/members/:id', auth.requiresLogin, auth.member.hasAuthorization, members.update)
  app.get('/members/:id/edit', auth.requiresLogin, auth.member.hasAuthorization, members.edit)
  app.delete('/members/:id', auth.requiresLogin, auth.member.hasAuthorization, members.destroy)
		
  // article routes
  app.param('id', function(req, res, next, id){
    Member
      .findOne({ _id : id })
      .populate('user', 'name')
      .exec(function (err, member) {
        if (err) return next(err)
        if (!member) return next(new Error('Failed to load member ' + id))
        req.member = member 

          next()
      })
  })

  // home route
  app.get('/', auth.requiresLogin, chat.show)

}
