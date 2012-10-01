
$(document).ready(function () {

	$(":button").attr('disabled', 'disabled');
	var socket = io.connect('/');
	socket.on('connect', function(){
	console.log(jade);
	$("#start").removeAttr('disabled');
	});
	
	socket.on('disconnect', function(){
	$(":button").attr('disabled', 'disabled');
	});

	socket.on('rtc_status', function (data) {
		console.log(data);
		$('#buddylistrows').html(jade.render('chat/list', {users: data.users}));

  });


});


