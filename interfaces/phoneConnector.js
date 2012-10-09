var restify = require('restify');
var client = restify.createJsonClient({
	version: '*',
	url: 'http://127.0.0.1:8080'
});

var sessions = {};
exports.sendMessage = function(data) {
	switch (data.type) {
	case 'offer':
		doOffer(data);
		break;
	case 'candidate':
		doCandidate(data);
		break;
	case 'answer':
		doAnswer(data);
		break;
  case 'icefinished':
    data.type = 'candidate';
    data['last'] = true;
    doCandidate(data);
    break;
	default:
		console.log("Error no matching case for sendMessage data type - phone Connector");
	}

}

function doOffer(data) {
  var target = data.target;
  var offerData = data;
  sessions[target] = {active : false, candidates: [], uuid : null};
	client.post('/session', {phoneNumber: '1002',
		callbackUrl: 'http://127.0.0.1:3001/session'
	},
	function(err, req, res, data) {
		if (err) 
			throw new Error(err);
		else {
			if (!data.session) {
        console.log(data);
				throw new Error('phoneConnecter: invalid response from POST /session');
			}
      console.log('phoneConnect: Got a response from session POST');
      console.log(data);
			var uuid = data.uuid;
      console.log('phoneConnector: session created ' + uuid + ' for target ' + target);
      sessions[target].uuid = uuid;
      sessions[target].active = true;
      console.log(sessions[target]);
      if(sessions[target].candidates.length > 0)
        doCandidates(sessions[target].candidates);
      client.put('/session/' + uuid, offerData, function(err, req, res, data){
        if(err){
          console.log('phoneConnector: session SDP put failed');
          throw new Error(err);
        }
        else{
          console.log('sent session sdp' + uuid);
        }
      });
		}
	});

}
function doCandidates(candidates){
  for (var x = 0; x < candidates.length; x++)
    doCandidate(candidates[x]);
}
function doCandidate(data) {
  var target = data.target;
  console.log('phoneConnector: new candidate for session ' + target);
  if(sessions[target]){
    if(sessions[target].active == true){
      client.put('/session/' + sessions[target].uuid,data, function (err, req, res, data){
        if(err)
          throw new Error(err);
        else{
          console.log('sent candidate');
        }
      });
    }else{
      console.log('phoneConnector: pushing candidate');
      sessions[target].candidates.push(data);
    }
  }
}

function doAnswer(data) {

}

