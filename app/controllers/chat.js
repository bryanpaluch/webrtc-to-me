var mongoose = require('mongoose')
	, _ = require('underscore')
  , redis = require("../../config/redis")
	, Member = mongoose.model('Member');


// show profile
exports.show = function (req, res) {
  var user = req.user

	redis.listChannel('chat', function(users){
  console.log(users);

	console.log(user._id);	
  console.log('some connected users')
  res.render('chat/show', {
      you: user,
      users: users,
      thisIsHash: false
  })
  
	});
}

exports.showHash = function (req, res) {
  var user = req.user
  
  redis.listChannel('chat', function(users){
  console.log(users);

  console.log(user._id);  
  console.log('some connected users')
  res.render('chat/show', {
      you: user,
      users: users,
      thisIsHash: true,
      hash: hash
  })
  
  });
}