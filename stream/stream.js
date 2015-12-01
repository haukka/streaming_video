var http = require('http'),
    fs = require('fs'),
    request = require('request');

var path = process.argv[2];
if (path && (path.indexOf('http') == -1 && path.indexOf('www') == -1)) {
    var stat = fs.statSync(path);
    var total = stat.size;
    var contentType = know_content_type(path);
} else {
    var url = path;
    path = "";
}

function know_content_type(path)
{
    var tmp = "";
    if (path.indexOf(".mp4", path.length - ".mp4".length) > -1)
	tmp = "video/mp4";
    else if (path.indexOf(".ogg", path.length - ".ogg".length) > -1)
	tmp = "video/ogg";
    else if (path.indexOf(".webm", path.length - ".webm".length) > -1)
	tmp = "video/webm";
    return (tmp);
}

http.createServer(function (req, res) {
    if (req.headers['range']) {
	var range = req.headers['range'];
	var pos = range.replace(/bytes=/, "").split("-");
	
	var start = parseInt(pos[0], 10);
	var end = pos[1] ? parseInt(pos[1], 10) : total-1;
	var chunksize = (end - start) + 1;
	
	var file = fs.createReadStream(path, {start: start, end: end});
	res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': contentType });
	file.pipe(res);
    } else {
	if (path) {
	    res.writeHead(200, { 'Content-Length': total, 'Content-Type': contentType });
	    fs.createReadStream(path).pipe(res);
	} else if (url) {
	    var link = request(url);
	    req.pipe(link);
	    link.pipe(res);
	}
    }
    res.on('close', function() {
	console.log('close');
    });
}).listen(3000, '127.0.0.1');

console.log('Server running at http://localhost:3000/');
