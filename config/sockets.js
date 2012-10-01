var mongoose = require('mongoose'),
Member = mongoose.model('Member'),
User = mongoose.model('User'),
parseCookie = require('cookie').parse,
mongoStore = require('connect-mongodb'),
redis = require("./redis"),
User = mongoose.model('User')


var users = {};



module.exports = function(server, config, auth) {



	io = require('socket.io').listen(server)
	var sessionStore = new mongoStore({
		url: config.db,
		collection: 'sessions'
	})

	io.set('authorization', function(data, accept) {
		if (data.headers.cookie) {
			data.cookie = parseCookie(data.headers.cookie)
			data.sessionID = data.cookie['connect.sid'].split(':')[1].split('.')[0]
			sessionStore.get(data.sessionID, function(err, sess) {
				if (err) console.log(err);
				data.user = sess.passport.user;

				//Start Pulling User data to attach to socket. 
				return accept(null, true);
			})
		} else {
			return accept('No cookie transmitted', false);
		}
	});

	io.sockets.on('connection', function(socket) {
		//Start Pulling User data to attach to socket. 
		User.findOne({
			_id: socket.handshake.user
		}).exec(function(err, user) {
			if (err) throw (err) 
			if (!user) throw ('Failed to load User ' + socket.handshake.session) 
			socket.user = {
				phoneNumber: user.phoneNumber,
				id: user._id,
				pic: user.twitter.profile_image_url
			}
			var userObj ={"name": user.twitter.name,
											 "handle": user.twitter.screen_name,
											 "status" : 'open',
											 "pic": user.twitter.profile_image_url};
		  redis.joinChannel('chat', user._id, userObj);	
			socket.join(user._id);
		//	socket.emit('rtc_status', {
		//		type: 'startup', users: users
	//		})
		})

		socket.on('rtc_request', function(data) {
			console.log("user id of this message is " + this.handshake.sessionID);
			console.log(this.user);
			console.log(data);
		});
	});
	
}

