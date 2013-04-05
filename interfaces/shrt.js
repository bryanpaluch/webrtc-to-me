var shrt = require('short')

shrt.connect('mongodb://localhost/webrtc-me');
shrt.connection.on('error', function(error) {
//	throw new Error(error);
});

module.exports.retrieve = function(hash, cb) {
	shrt.retrieve(hash, function(err, shortObj) {
    cb(err,shortObj);
  });
}
module.exports.generate = function(id, cb){
  shrt.generate(id, function(err, shortObj) { 
  cb(err,shortObj);
  });
}

