
module.exports = {
    development: {
      db: 'mongodb://localhost/cmmaybe',
      twitter: {
          consumerKey: ""
        , consumerSecret: ""
        , callbackURL: "http://localhost:3000/auth/twitter/callback"
      },
    }
  , test: {

    }
  , production: {

    }
}
