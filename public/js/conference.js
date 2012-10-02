
var usersList;
var cstate = 'open';

$(document).ready(function () {
	//Load connected users from json script
	usersList = JSON.parse($("#users_list").html());
	$(":button").attr('disabled', 'disabled');

	var socket = io.connect('/');
	socket.on('connect', function(){

	$("#start").removeAttr('disabled');
	});
	
	socket.on('disconnect', function(){
	$(":button").attr('disabled', 'disabled');
	});

	socket.on('rtc_status', function (data) {
		console.log(data);
		if(data.channelJoin){

		$('#buddylistrows').html(jade.render('chat/list', {users: data.users}));




		}

  	});

	$(":button").live('click',function (){
			console.log(this);
			var action = $(this).attr('action');
			var target = $(this).attr('target');
			if(action == 'startChat'){
			toggleStart(this);
			}
			socket.emit('rtc_request', {'action' : action, 'target' : target});
	});

});

function channelJoin(user){
	if(usersList[user.id]){

	}else{
		usersList[user.id] = usersList;
		renderList();
	}

}

function renderList()
{
	$('#buddylistrows').html(jade.render('chat/list', {users: usersList}));
}