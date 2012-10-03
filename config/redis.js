var redis = require("redis")

var rclient = redis.createClient(null,null, {detect_buffers:true});
var users = {};

rclient.on("error", function(err){
  console.log("Error " + err);
});
rclient.flushall(function(err){
console.log("flush complete");
});

exports.joinChannel = function (channel,id, userObj){
	console.log("channel add for " + channel + " For id " + id);	
	rclient.sadd(channel, id);
	console.log(userObj);
	
	for (var k in userObj){
			console.log(userObj[k], k);
			rclient.HMSET(id, k, userObj[k]);
  }	
	//this is buggy waiting for update
	//rclient.HMSET(id, userObj);

}  
exports.exitChannel = function (channel, id){
	rclient.srem(channel, id);
	//rclient.hdel(id);
}

exports.listChannel = function (channel, callback){
var channelListing = {}
 console.log("Channel listing for " + channel);
 rclient.smembers(channel,function(err, replies)
		{
		console.log(replies);	
		if(replies.length > 0){
			console.log("finding replies");
			var channelCount = 0;
		  replies.forEach(function(reply, index){
				console.log('asking hget all');
				rclient.hgetall(reply, function(err, obj){
					console.log('hget all returned');
					console.log(obj);
					channelCount++;
				  channelListing[replies[index]] = obj;	
					if(channelCount >= replies.length){
						console.log('finished channel listing');
						console.log(channelListing);
						callback(channelListing);
					}
				});
			});
		}else{
			callback(channelListing);
		}
		});
}
