var redis = require("redis")

var rclient = redis.createClient(null,null, {detect_buffers:true});
var users = {};

rclient.on("error", function(err){
  console.log("Redis error " + err);
});
rclient.flushall(function(err){
});

exports.joinChannel = function (channel,id, userObj){
	rclient.sadd(channel, id);
	for (var k in userObj){
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
 rclient.smembers(channel,function(err, replies)
		{
		console.log(replies);	
		if(replies.length > 0){
			var channelCount = 0;
		  replies.forEach(function(reply, index){
				rclient.hgetall(reply, function(err, obj){
					channelCount++;
				  channelListing[replies[index]] = obj;	
					if(channelCount >= replies.length){
						callback(channelListing);
					}
				});
			});
		}else{
			callback(channelListing);
		}
		});
}
