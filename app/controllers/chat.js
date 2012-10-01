var mongoose = require('mongoose')
	, _ = require('underscore')
  , redis = require("../../config/redis")
	, Member = mongoose.model('Member');


// show profile
exports.show = function (req, res) {
  var user = req.user
  // Member	
  //   .find({})
  //   .populate('user', 'name')
  //   .sort({'createdAt': -1}) // sort by date
  //   .exec(function(err, members) {
  //     if (err) return res.render('500')
  //     Member.count().exec(function (err, count) {
		// 		members.unshift({name: "You", phoneNumber: user.phoneNumber});
		// 		console.log(members);
  //       res.render('conference/show', {
  //           title: 'List of Conference Users'
		// 			, user : user
  //         , users: members
		// 			, conference_state : 'conferenceState' 
  //       })
  //     })
  //   }); 
	redis.listChannel('chat', function(users){
	
	var users = { '2348239823423' : {name: 'Bryan P',
                       handle: 'letthisbemywrit',
                       status: 'open',
                       pic: 'http://a0.twimg.com/profile_images/320465858/twitter_normal.jpg'}};

  res.render('chat/show', {
      user: user,
      users: users
  })
	});
}
