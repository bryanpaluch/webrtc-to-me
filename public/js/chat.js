var usersList;
var cstate = 'open';
var socket;
var localVideo;
var localStream;
var remoteVideo;
var status;
var pc;
var initiator;
var started = false;
var currentTarget;
var currentTargetType;
var you;
var hash = null;
var socketReady = false;
var userMediaReady = false;
var isRTCPeerConnection = true;
var mediaConstraints = {
	'has_audio': true,
	'has_video': true
};
function selectText() {
	if (document.selection) {
		var range = document.body.createTextRange();
		range.moveToElementText(document.getElementById('shortUrl'));
		range.select();
	} else if (window.getSelection) {
		var range = document.createRange();
		range.selectNode(document.getElementById('shortUrl'));
		window.getSelection().addRange(range);
	}
}
$("#shortUrl").click(function() {
	selectText()
});

$(document).ready(function() {
	init();
	//Load connected users from json script
	usersList = JSON.parse($("#users_list").html());
	you = JSON.parse($("#you").html());
	if ($("#hash")) {
		console.log('Hash Detected' + $("#hash").html());
		hash = $("#hash").html();
	}
	$(":button").attr('disabled', 'disabled');

	socket = io.connect('/');
	socket.on('connect', function() {

		$(":button").removeAttr('disabled');
	});

	socket.on('disconnect', function() {
		$(":button").attr('disabled', 'disabled');
	});

	socket.on('rtc_status', function(data) {
		console.log(data);
		if (data.channelJoin) {
			console.log('Someone joined channel');
			channelJoin(data.channelJoin);
		} else if (data.channelExit) {
			channelExit(data.channelExit);
		} else if (data.ready) {
			socketReady = true;
			webRtcReady();
		} else if (data.message){
       
      addToChatLog(data.user.name,  data.message);
    }
	});
	socket.on('rtc_request', function(req) {
		currentTarget = req.target;
    console.log(req);
		$(":button").attr('disabled', 'disabled');
		if (isRTCPeerConnection)	
			processSignalingMessage(req);
		else
			processSignalingMessage00(req);

	});
	socket.on('rtc_reload', function(data) {
		console.log("New code on site, or bad io socket data, bye bye");
		window.location = data.destination;
	});

	$(":button").live('click', function() {
		console.log(this);
		var action = $(this).attr('action');
		var target = $(this).attr('target');
    var targetType = $(this).attr('target_type');
		if (action === 'startChat') {
			currentTarget = target;
      currentTargetType = targetType;
			$(":button").attr('disabled', 'disabled');
			initiator = true;
			maybeStart();
		}
    else if( action === 'sendtext'){
      var data = $(target).val();
      console.log(data);
      if(data){
        socket.emit('rtc_chat', data);
        $(target).val('');
        }
    }
	//	socket.emit('rtc_request', {
	//		'action': action,
	//		'target': target
	//	});
	});

});

function addToChatLog( who, data){
  var newline = who + ": " + data + "\n"; 
  $("#chatlog").val($("#chatlog").val() + newline);
}
function webRtcReady() {
	if (socketReady && userMediaReady) {
		console.log(socketReady);
		console.log(userMediaReady);
		console.log('webrtc ready');
		if (hash) {
			socket.emit('rtc_join', {
				hash: hash
			});
		} else {
			socket.emit('rtc_join', you);
		}
	}
}
function channelJoin(user) {
	if (usersList[user.id]) {
		console.log('user already in channel');
	} else {
		usersList[user.id] = user;
		renderList();
    addToChatLog('announce',  user.name+ " has joined the chat");
  }
}
function channelExit(userid) {
	if (usersList[userid]) {
		delete usersList[userid];
		renderList();
	}
}
function renderList() {
	console.log('rendering new user list');
	console.log(usersList);
	$('#buddylistrows').html(jade.render('chat/list', {
		you: you,
		users: usersList
	}));
}
function init() {
	status = $('#status');
	localVideo = $('#localVideo')[0];
	remoteVideo = $('#remoteVideo')[0];
	getUserMedia();
}
function createPeerConnection() {
	var pc_config = {
		"iceServers": [{
			"url": "stun:stun.l.google.com:19302"
		}]
	};
	try {
		pc = new webkitRTCPeerConnection(pc_config);
		pc.onicecandidate = onIceCandidate;
		console.log("Created webkitRTCPeerConnection with config \"" + JSON.stringify(pc_config) + "\".");
	} catch(e) {
		try {
			var stun_server = "";
			if (pc_config.iceServers.length !== 0) {
				stun_server = pc_config.iceServers[0].url.replace('stun:', 'STUN ');
			}
			pc = new webkitPeerConnection00(stun_server, onIceCandidate00);
			isRTCPeerConnection = false;
			console.log("Created webkitPeerConnnection00 with config \"" + stun_server + "\".");
		} catch(e) {
			console.log("Failed to create PeerConnection, exception: " + e.message);
			alert("Cannot create PeerConnection object; Is the 'PeerConnection' flag enabled in about:flags?");
			return;
		}
	}
	pc.onconnecting = onSessionConnecting;
	pc.onopen = onSessionOpened;
	pc.onaddstream = onRemoteStreamAdded;
	pc.onremovestream = onRemoteStreamRemoved;
  pc.onnegotiationneeded = onNegotiationNeeded;
}
function maybeStart() {
	if (!started && localStream) {
		console.log("Creating PeerConnection.");
		createPeerConnection();
		console.log("Adding local stream.");
		pc.addStream(localStream);
		started = true;
		if (initiator) doCall();
	}
}
function doCall() {
	console.log("Send offer to peer");
	if (isRTCPeerConnection) {
		pc.createOffer(setLocalAndSendMessage, null, mediaConstraints);
	} else {
		var offer = pc.createOffer(mediaConstraints);
		pc.setLocalDescription(pc.SDP_OFFER, offer);
		sendMessage({
			type: 'offer',
			sdp: offer.toSdp()
		});
		pc.startIce();
	}
}

function doAnswer() {
	console.log("Send answer to peer");
	if (isRTCPeerConnection) {
		pc.createAnswer(setLocalAndSendMessage, null, mediaConstraints);
	} else {
		var offer = pc.remoteDescription;
		var answer = pc.createAnswer(offer.toSdp(), mediaConstraints);
		sendMessage({
			type: 'answer',
			sdp: answer.toSdp()
		});
		pc.startIce();
	}
}

function setLocalAndSendMessage(sessionDescription) {
	pc.setLocalDescription(sessionDescription);
	sendMessage(sessionDescription);
}

function sendMessage(message) {
	message.target = currentTarget;
  message.targetType = currentTargetType;
	socket.emit('rtc_request', message);
}

function processSignalingMessage(msg) {

	if (msg.type === 'offer') {
		// Callee creates PeerConnection
		if (!initiator && ! started)  
			maybeStart();
		// We only know JSEP version after createPeerConnection()
		if (isRTCPeerConnection) pc.setRemoteDescription(new RTCSessionDescription(msg));
		else pc.setRemoteDescription(pc.SDP_OFFER, new SessionDescription(msg.sdp));

		doAnswer();
	} else if (msg.type === 'answer' && started) {
		pc.setRemoteDescription(new RTCSessionDescription(msg));
	} else if (msg.type === 'candidate' && started) {
		var candidate = new RTCIceCandidate({
			sdpMLineIndex: msg.label,
			candidate: msg.candidate
		});
		pc.addIceCandidate(candidate);
	} else if (msg.type === 'bye' && started) {
		onRemoteHangup();
	}
}

function processSignalingMessage00(message) {
	var msg = JSON.parse(message);
  console.log(msg);
	if (msg.type === 'answer' && started) {
		pc.setRemoteDescription(pc.SDP_ANSWER, new SessionDescription(msg.sdp));
	} else if (msg.type === 'candidate' && started) {
		var candidate = new IceCandidate(msg.label, msg.candidate);
		pc.processIceMessage(candidate);
	} else if (msg.type === 'bye' && started) {
		onRemoteHangup();
	}
}

function getUserMedia() {
	try {
		navigator.webkitGetUserMedia({
			audio: true,
			video: true
		},
		onUserMediaSuccess, onUserMediaError);
		console.log("Requested access to local media with new syntax.");
	} catch(e) {
		try {
			navigator.webkitGetUserMedia("video,audio", onUserMediaSuccess, onUserMediaError);
			console.log("Requested access to local media with old syntax.");
		} catch(e) {
			alert("webkitGetUserMedia() failed. Is the MediaStream flag enabled in about:flags?");
			console.log("webkitGetUserMedia failed with exception: " + e.message);
		}
	}
}
function onUserMediaSuccess(stream) {
	console.log("User has granted access to local media.");
	var url = webkitURL.createObjectURL(stream);
	localVideo.style.opacity = 1;
	localVideo.src = url;
	localStream = stream;
	$('#localTwitter').removeAttr('hidden');
	userMediaReady = true;
	webRtcReady();
}
function onUserMediaError(error) {
	console.log("Failed to get access to local media. Error code was " + error.code);
	alert("Failed to get access to local media. Error code was " + error.code + ".");
}
function onNegotiationNeeded(event){
  console.log('negoiation needed');
  console.log(event);
}
function onIceCandidate(event){
	if (event.candidate) {
    console.log(event);
		sendMessage({type: 'candidate',
								 label: event.candidate.sdpMLineIndex,
								 id: event.candidate.sdpMid,
								 candidate: event.candidate.candidate,
                 });
	} else {
    console.log(event);
		sendMessage({type: 'icefinished',
                });
		console.log("End of candidates");
	}
}
function onIceCandidate00(candidate, moreToFollow) {
	if (candidate) {
		sendMessage({
			type: 'candidate',
			label: candidate.label,
			candidate: candidate.toSdp()
		});
	}
	if (!moreToFollow) {
		console.log("End of candidates.");
	}
}
function onSessionConnecting(message) {
	console.log("Session connecting.");
}
function onSessionOpened(message) {
	console.log("Session opened.");
}
function onRemoteStreamAdded(event) {
	console.log("Remote stream added.");
	var url = webkitURL.createObjectURL(event.stream);
	remoteVideo.src = url;
	waitForRemoteVideo();
}

function onRemoteStreamRemoved(event) {
	console.log("Remote stream removed.");
}

function onHangup() {
	console.log("Hanging up.");
	started = false; // Stop processing any message
	transitionToDone();
	isRTCPeerConnection = true;
	pc.close();
	pc = null;
}

function onRemoteHangup() {
	console.log('Session terminated.');
	started = false; // Stop processing any message
	transitionToWaiting();
	pc.close();
	pc = null;
	initiator = 0;
}

function waitForRemoteVideo() {
	if (remoteVideo.currentTime > 0) {
		transitionToActive();
	} else {
		setTimeout(waitForRemoteVideo, 100);
	}
}
function transitionToActive() {
	$('#remoteTwitter').html('<img src="' + usersList[currentTarget].pic + '"/>');
	remoteVideo.style.opacity = 1;
	$('#endcall').removeAttr('hidden');
}

function transitionToWaiting() {
	setTimeout(function() {
		remoteVideo.src = ""
	},
	500);
	remoteVideo.style.opacity = 0;
	$('#endcall').attr('hidden', 'hidden');
}

function transitionToDone() {
	$('#remoteTwitter').html('');
	localVideo.style.opacity = 0;
	remoteVideo.style.opacity = 0;
}

