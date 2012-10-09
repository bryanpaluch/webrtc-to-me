var mongoose = require('mongoose'),
_ = require('underscore'),
User = mongoose.model('User'),
shrt = require('short'),
redis = require('./../../interfaces/redis');

shrt.connect('mongodb://localhost/webrtc-me');
shrt.connection.on('error', function(error) {
	throw new Error(error);
});

exports.signin = function(req, res) {}

// auth callback
exports.authCallback = function(req, res, next) {
	if (req.session.initialRequest) {
		res.redirect(req.session.initialRequest);
	} else {
		res.redirect('/');
	}
}

// login
exports.login = function(req, res) {
	res.render('users/login', {
		title: 'Login'
	});
}

// sign up
exports.signup = function(req, res) {
	res.render('users/signup', {
		title: 'Sign up'
	});
}

// logout
exports.logout = function(req, res) {
	req.logout();
	res.redirect('/login');
}

// session
exports.session = function(req, res) {
	res.redirect('/');
}

// signup
exports.create = function(req, res) {
	var user = new User(req.body);
	user.provider = 'local';
	user.save(function(err) {
		if (err) return res.render('users/signup', {
			errors: err.errors
		});
		req.logIn(user, function(err) {
			if (err) return next(err);
			return res.redirect('/');
		})
	})
}

exports.update = function(req, res) {
	var user = req.user;
	var oldShort = req.profile.chatUrl;
	if (req.body.phoneInChat == 'on') req.body.phoneInChat = true;
	else req.body.phoneInChat = false;

	if (req.body.regenerate == 'on') {
		shrt.generate(user.id, function(error, shrtObj) {
			req.body.chatUrl = shrtObj.hash;
			user = _.extend(user, req.body);
			user.save(function(err, doc) {
				if (err) {
					res.render('users/show', {
						title: 'Edit User',
						user: user,
						errors: err.errors
					});
				}
				else {
					res.redirect('/users/' + user._id);
				}
			});

		});
		if (oldShort) {
			shrt.retrieve(oldShort, function(error, oldShortObj) {
				if (error) throw Error(error);
				oldShortObj.remove();
				oldShortObj.save(function(err) {});
			});
		}
	} else {
		user = _.extend(user, req.body);
		user.save(function(err, doc) {
			if (err) {
				res.render('users/show', {
					title: 'Edit User',
					user: user,
					errors: err.errors
				})
			}
			else {
				checkEndPointStateChange(doc);
				res.redirect('/users/' + user._id)
			}
		});
	}
}

// show profile
exports.show = function(req, res) {
	var user = req.profile
	res.render('users/show', {
		title: user.name,
		user: user
	});
}

function checkEndPointStateChange(doc) {
	if (doc.phoneInChat && doc.phoneNumber) {
		var phone = {
			"name": 'Phone',
			"id": doc.id + '-phone',
			"pic": '/img/cell.png',
			'status': 'open',
			'type': 'phone'
		}
    redis.joinChannel(doc.id + '-owner', doc.id + '-phone', phone);
	}else {
    redis.exitChannel(doc.id + '-owner', doc.id + '-phone');
  }
}
