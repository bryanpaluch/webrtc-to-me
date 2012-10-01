var mongoose = require('mongoose')
	, _ = require('underscore')
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

  res.render('chat/show', {
      user: user
  })
}
