
module.exports = {
    development: {
      db: 'mongodb://localhost/webrtc-me',
      twitter: {
          consumerKey: ""
        , consumerSecret: ""
        , callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
      },
      webrtcgw: {
          consumerKey: 'abc123443'
        , consumerSecret: 'ssh-sec323ret'
        , callbackURL: "http://127.0.0.1:3000/auth/rtcgateway/callback"
        //This server MUST be a different IP or domain to work correctly or Cookies will be overwritten
        , oauthServer: 'http://127.0.0.2:3002'
      },
			shortUrl: 'http://127.0.0.1:3000/c/',
      jsep2sipgw: "http://127.0.0.1:8080"
    }
  , test: {

    }
  , production: {

    }
}
