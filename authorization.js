
/*
 *  Generic require login routing middleware
 */

exports.requiresLogin = function (req, res, next) {
	console.log(req.session); 
	if (!req.isAuthenticated()) {
 	  req.session['initialRequest'] = req.url;
		console.log(req.session); 
    return res.redirect('/login')
  }
  next()
};


/*
 *  User authorizations routing middleware
 */

exports.user = {
    hasAuthorization : function (req, res, next) {
      if (req.profile.id != req.user.id) {
        return res.redirect('/users/'+req.profile.id)
      }
      next()
    }
}


exports.member = {
    hasAuthorization : function (req, res, next) {
      if (req.member.user.id != req.user.id) {
        return res.redirect('/member/'+req.article.id)
      }
      next()
    }
}
