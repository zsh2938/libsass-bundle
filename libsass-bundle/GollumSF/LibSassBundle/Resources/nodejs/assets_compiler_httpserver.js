
var fs = require('fs');

var options = {
	includePaths: []
};
var key = null;
for (var i = 0; i < process.argv.length; i++) {
	var arg = process.argv[i];
	if (key) {
		if (options[key]) {
			options[key].push (arg);
		} else {
			options[key] = arg;
		}
		key = null;
	} else {
		if (arg.substr(0, 2) == "--") {
			key = arg.substr(2);
		}
	}
}

console.log ("options: ", options);

var port         = options["port"]         || 8989;
var outputStyle  = options["outputStyle"]  || "expanded";
var rootPath     = options["rootPath"]     || "./";
var bundlePath   = options["bundlePath"]   || "vendor/gollumsf/libsass/libsass-bundle/GollumSF/LibSassBundle";
var includePaths = options["includePaths"] || [];
var nodeSassPath = options["nodeSassPath"] || __dirname+"/../../../../../node-sass";

var ___COMPASS_HTTP_PATH___  = options["http_path"]  || null;
var ___COMPASS_FONTS_DIR___  = options["fonts_dir"]  || null;
var ___COMPASS_IMAGES_DIR___ = options["images_dir"] || null;

var http = require('http');
var sass = require(nodeSassPath+'/lib/index.js');

http.createServer(function (req, res) {
	
	var assetPath = req.url;
	
	if (!fs.existsSync(assetPath)) {
		res.writeHead(404, {"Content-Type": "text/plain"});
		res.write("404 File not found: "+assetPath+"\n");
		res.end();
		
		console.error ("404 File not found: "+assetPath);
		return;
	}
	
	if (assetPath.substr(-3) == '.js') {
		
		fs.readFile(assetPath, "utf8", function (err,data) {
			res.writeHead(200, {"Content-Type": "text/javascript"});
			res.write(data);
			res.end();
		});
		return
	}
	
	var includeFinal = [
		bundlePath+"/Resources/compass/include/",
		bundlePath+"/Resources/compass/compass-mixins/lib/"
	];
	for (var i = 0; i < includePaths.length; i++) {
		includeFinal.push(includePaths[i]);
	}
	
	var options = ({
		file: assetPath,
		outputStyle: outputStyle,
		includePaths: includeFinal
	});
	
	console.log ("Compile: "+assetPath);
	sass.render(options, function(err, result) {
		if (err) {
			console.error (err);
			res.writeHead(500, {"Content-Type": "text/plain"});
			res.write(err+"\n");
		} else {
			res.writeHead(200, {'Content-Type': 'text/css'});
			
			content = result.css.toString();
			content = content.replace(new RegExp('___COMPASS_HTTP_PATH___' , 'g'), ___COMPASS_HTTP_PATH___  ? ___COMPASS_HTTP_PATH___ +'/' : '');
			content = content.replace(new RegExp('___COMPASS_FONTS_DIR___' , 'g'), ___COMPASS_FONTS_DIR___  ? ___COMPASS_FONTS_DIR___ +'/' : '');
			content = content.replace(new RegExp('___COMPASS_IMAGES_DIR___', 'g'), ___COMPASS_IMAGES_DIR___ ? ___COMPASS_IMAGES_DIR___+'/' : '');
			
			res.write (content);
		}
		res.end();
	});
	
}).listen(port);