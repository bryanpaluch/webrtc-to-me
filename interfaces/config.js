
module.exports = {
    development: {
      db: 'mongodb://localhost/webrtc-me',
      twitter: {
          consumerKey: "zPfr7u2nAen2pLVzoW143g"
        , consumerSecret: "D3WjaeDDqhTVf7a812Bmm65jUwMiScVSgWhLn9Djg2I"
        , callbackURL: "http://10.255.132.197:3000/auth/twitter/callback"
      },
			shortUrl: 'http://10.255.132.197:3000/c/'
    }
  , test: {

    }
  , production: {

    }
}
