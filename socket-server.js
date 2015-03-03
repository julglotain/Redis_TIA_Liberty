var crypto	= require('crypto');

var server = require('http').createServer();
var io = require('socket.io')(server);
io.on('connection', function(socket){
  socket.on('event', function(data){});
  socket.on('disconnect', function(){});
});

var port = process.argv.slice(2)[0] || 1948;

server.listen(port);

// hold current slide data 
var currentSlideData; 

io.sockets.on('connection', function(socket) {

	socket.on('voterconnected', function(cb){
		cb(currentSlideData);
	});

	socket.on('slidechanged', function(slideData) {
		if (typeof slideData.secret == 'undefined' || slideData.secret == null || slideData.secret === '') return;
		if (createHash(slideData.secret) === slideData.socketId) {
			slideData.secret = null;
			currentSlideData = slideData;
			socket.broadcast.emit(slideData.socketId, slideData);
		};
	});

});

/*

app.configure(function() {
	[ 'css', 'js', 'plugin', 'lib' ].forEach(function(dir) {
		app.use('/' + dir, staticDir(opts.baseDir + dir));
	});
});

app.get("/", function(req, res) {
	res.writeHead(200, {
		'Content-Type': 'text/html',
		'access-control-allow-origin': '*'
	});
	fs.createReadStream(opts.baseDir + '/index.html').pipe(res);
});

app.get("/token", function(req,res) {
	var ts = new Date().getTime();
	var rand = Math.floor(Math.random()*9999999);
	var secret = ts.toString() + rand.toString();
	res.send({secret: secret, socketId: createHash(secret)});
});
*/
var createHash = function(secret) {
	var cipher = crypto.createCipher('blowfish', secret);
	return(cipher.final('hex'));
};
/*
// Actually listen
app.listen(opts.port || null);
*/
var brown = '\033[33m',
	green = '\033[32m',
	reset = '\033[0m';

console.log( brown + "reveal.js:" + reset + " Multiplex running on port " + green + port + reset );