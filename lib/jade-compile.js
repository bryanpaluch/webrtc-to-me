define(['fs', 'path', 'mkdirp', 'jade'], function(fs, path, mkdirp, jade) {

  var basename = path.basename;
  var dirname = path.dirname;
  var resolve = path.resolve;
  var join = path.join;

  return function(path, out, options) {
	 if (out)
      options.filename = out;

    if (!(path instanceof Array))
      path = [path];
 var files = path;
for (var i = 0; i < files.length; i++)
      renderFile(files[i]);
function renderFile(path) {
      var re = /\.jade$/;
      fs.lstat(path, function(err, stat) {
        if (err) throw err;  if (stat.isFile() && re.test(path)) {
          fs.readFile(path, 'utf8', function(err, str) {
            if (err) throw err;
            options.filename = path;
            var fn = jade.compile(str, options).toString().substring(18);
            path = path.replace(re, '.js');
            if (out) path = join(out, basename(path));
            var dir = resolve(dirname(path));
            mkdirp(dir, 0755, function(err){
              if (err) throw err;
              fs.writeFile(path, 'define(["jade-runtime"], function() { return function' + fn + ' });', function(err){
                if (err) throw err;
              });
            });
          });      } else if (stat.isDirectory()) {
          fs.readdir(path, function(err, files) {
            if (err) throw err;
            var dirfiles = files.map(function(filename) {
              return path + '/' + filename;
            });
            for (var i = 0; i < dirfiles.length; i++)
              renderFile(dirfiles[i]);
          });
        }
      });
    }
  }
});
