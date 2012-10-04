
module.exports = {
    development: {
      db: 'mongodb://localhost/webrtc-me',
      twitter: {
          consumerKey: ""
        , consumerSecret: ""
        , callbackURL: "http://10.255.132.197:3000/auth/twitter/callback"
      },
			shortUrl: 'http://10.255.132.183:3000/c/'
    }
  , test: {

    }
  , production: {

    }
}
