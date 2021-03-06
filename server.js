/* Main application entry file. Please note, the order of loading is important.
 * Configuration loading and booting of controllers and custom error handlers */

var app = require('express')()
	, server = require('http').createServer(app)
  , fs = require('fs')
  , passport = require('passport')

require('express-namespace')

// Load configurations
var env = process.env.NODE_ENV || 'development'
  , config = require('./config/config')[env]
  , auth = require('./app/controllers/authorization')
// Bootstrap db connection
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
mongoose.connect(config.db)

// Bootstrap models
var models_path = __dirname + '/app/models'
  , model_files = fs.readdirSync(models_path)
model_files.forEach(function (file) {
  require(models_path+'/'+file)
})

// bootstrap passport config
require('./config/passport').boot(passport, config)
//bootstrap express settings
require('./config/settings').boot(app, config, passport)

// Bootstrap interfaces
require('./interfaces/phoneConnector').EndPoint(app, config);
require('./interfaces/routes')(app, passport, auth);
require('./interfaces/sockets')(server, config, auth);

// Start the app by listening on <port>
var port = config.port
server.listen(port)
console.log('Express app started on port '+port)
