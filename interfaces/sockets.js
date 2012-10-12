var mongoose = require('mongoose'),
Member = mongoose.model('Member'),
User = mongoose.model('User'),
parseCookie = require('cookie').parse,
mongoStore = require('connect-mongodb'),
redis = require("./redis"),
phoneConnector = require("./phoneConnector"),
User = mongoose.model('User'),
shrt = require('./shrt'),
util = require('util'),
pc = phoneConnector.createConnector();

module.exports = function(server, config, auth) {

	io = require('socket.io').listen(server)
	var sessionStore = new mongoStore({
		url: config.db,
		collection: 'sessions'
	})
	io.set('log level', 0);

	io.set('authorization', function(data, accept) {
		if (data.headers.cookie) {
			data.cookie = parseCookie(data.headers.cookie)
			data.sessionID = data.cookie['connect.sid'].split(':')[1].split('.')[0]
			sessionStore.get(data.sessionID, function(err, sess) {
				if (sess) {
					if (err) console.log(err);
					data.user = sess.passport.user;

					//Start Pulling User data to attach to socket. 
					return accept(null, true);
				} else {
					return accept('No Session Found', false);
				}
			})
		} else {
			return accept('No cookie transmitted', false);
		}
	});

	io.sockets.on('connection', function(socket) {
		socket.legs = {};
		//Start Pulling User data to attach to socket. 
		User.findOne({
			_id: socket.handshake.user
		}).exec(function(err, user) {
			if (err) throw (err);
      if (!user) throw ('Failed to load User ' + socket.handshake.session);
      socket.user = {
				"name": user.twitter.name,
				"handle": user.twitter.screen_name,
				"id": user._id,
				"pic": user.twitter.profile_image_url,
				'status': 'open',
        'type': 'socketio'
			}
			var userObj = {
				"name": user.twitter.name,
				"handle": user.twitter.screen_name,
				"status": 'open',
				"pic": user.twitter.profile_image_url,
				"id": user._id,
        'type': 'socketio'
			};
			socket.join(user._id);
			socket.emit('rtc_status', {
				ready: true
			});

		});
		socket.on('disconnect', function() {
			io.sockets. in (socket.chatChannel).emit('rtc_status', {
				channelExit: socket.user.id
			});
			redis.exitChannel(socket.chatChannel, socket.user.id);
			for (var leg in socket.legs) {
				io.sockets. in (leg).emit('rtc_request', {
					type: 'bye',
					target: socket.user.id
				});
			}
		});
		socket.on('rtc_join', function(data) {
			if (data.hash) {
				shrt.retrieve(data.hash, function(err, shortObj) {
					if (err) throw Error(err);
					if (shortObj) {
						socket.chatChannel = shortObj.URL + '-owner';
						redis.joinChannel(shortObj.URL + '-owner', socket.user.id, socket.user);
						socket.join(shortObj.URL + '-owner');
						io.sockets. in (shortObj.URL + '-owner').emit('rtc_status', {
							channelJoin: socket.user
						});
					} else {
						socket.emit('rtc_reload', {
							"destination": '/'
						});
					}
				});
			} else {
				socket.chatChannel = socket.user.id + '-owner';
				redis.joinChannel(socket.user.id + '-owner', socket.user.id, socket.user);
				socket.join(socket.user.id + '-owner');
				io.sockets. in (socket.user.id + '-owner').emit('rtc_status', {
					channelJoin: socket.user
				});
			}
		})
		socket.on('rtc_request', function(data) {
			console.log("user id of this message is " + this.handshake.sessionID);
			console.log(data);
			var target = data.target;
			data.target = this.user.id;
			if (data.type == 'offer' || data.type == 'answer') {
				socket.legs[target] = true;
			}
      if(data.targetType == 'phone'){
        console.log(pc);
        pc.send(data);
      }else{
			io.sockets. in (target).emit('rtc_request', data);
      }
		});
	});
  pc.on('event', function(data){
      var target = data.target;
      io.sockets.in(target).emit('rtc_request', data);
      console.log('sent to client ' + target);
      if(data.type == 'offer' || data.type == 'answer'){
        socket.legs[target] = true;
      }
  });
}

