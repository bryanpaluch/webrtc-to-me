var mongoose = require('mongoose'),
Member = mongoose.model('Member'),
User = mongoose.model('User'),
parseCookie = require('cookie').parse,
mongoStore = require('connect-mongodb'),
User = mongoose.model('User')


var conferences = {};

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
				id: user._id
			}
			socket.join(user._id);
			socket.emit('conf_status', {
				type: 'startup'
			})
		})

		socket.on('conf_request', function(data) {
			console.log("user id of this message is " + this.handshake.sessionID);
			console.log(this.user);
			console.log(data);
			if (data.action == 'start' && data.target == 'conference') {
				getMembersAndSend(this.user, data);
			}else if(data.action != 'stop' && data.target){
				actionUser(this.user,data);
			}else if(data.action == 'stop' && data.target){
				actionUsers(this.user,data);
			}
		});
	});
	var actionUser = function actionUser(user,data){
		console.log("creating " + data.action +" amqp call");
		if (conferences[user.id] === 'true') {
			var apiCall = {}
			apiCall.id = user.id
			apiCall.user = {}
			apiCall.user.memberid = data.target;
			apiCall.action = data.action;
			publishRequest(apiCall, user.id)
		}else{
			console.log('No active conference');
		}
	}
	var actionUsers = function actionUsers(user,data){
		console.log("creating " + data.action +" amqp call");
		if (conferences[user.id] === 'true') {
			var apiCall = {}
			apiCall.id = user.id
			apiCall.user = {}
			apiCall.user.memberid = 'all';
			apiCall.action = data.action;
			publishRequest(apiCall, user.id)
		}else{
			console.log('No active conference');
		}
	}
	
}

