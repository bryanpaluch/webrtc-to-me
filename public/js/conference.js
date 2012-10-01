var conferenceShow;
require(['/templates/conference/table.js'], function(parse){
	conferenceShow = parse;
});

$(document).ready(function () {

	$(":button").attr('disabled', 'disabled');
	var socket = io.connect('/');
	socket.on('connect', function(){
	$("#start").removeAttr('disabled');
	});
	
	socket.on('disconnect', function(){
	$(":button").attr('disabled', 'disabled');
	});

	socket.on('conf_status', function (data) {
		console.log(data)
		if(data.hasOwnProperty('status'))
		{
			var members = []	
			for (x in data.status.members)
			{
				var stat = data.status.members[x].status
				if(data.status.members[x].talking)
					stat = 'Talking'
				members.push({name: data.status.members[x].name,phoneNumber : x, 
									speak : data.status.members[x].speak, hear : data.status.members[x].hear,
									status : stat, memberid: data.status.members[x].memberid})	
			}	
			$('#conf_users').html(conferenceShow({users: members}))
		}
    if(data.hasOwnProperty('action')){
			if(data.action== 'stopped'){	
			$(":button").attr('disabled', 'disabled');
			$("#start").removeAttr('disabled');
			toggleStart($("#start"));
			}
		}


  });


});


