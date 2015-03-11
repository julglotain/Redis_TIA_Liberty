var express = require('express'),
 	app = express(),
 	path = require('path'),
	server = require('http').createServer(app),
	io = require('socket.io')(server),
	basicAuth = require('basic-auth'),
	bodyParser = require('body-parser'),
	crypto	= require('crypto'),
	argv = require('minimist')(process.argv.slice(2)),
	distPath = argv.distPath || '',
	socketOnly = ('socketOnly' in argv) ? true : false,
	port = argv.p || 1337;
	

// Actually listen
server.listen(port);

if(!socketOnly){

	app.use("/public", express.static(path.join(__dirname, distPath, 'public')));
	app.use("/slides", express.static(path.join(__dirname, distPath, 'slides')));

	var auth = function (req, res, next) {
		function unauthorized(res) {
		res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
		return res.send(401);
	};

	var user = basicAuth(req);

	if (!user || !user.name || !user.pass) {
		return unauthorized(res);
	};

	if (user.name === 'foo' && user.pass === 'bar') {
		return next();
	} else {
		return unauthorized(res);
		};
	};

	/**
	* serving pages
	*/
	app.get('/', function (req, res) {
		res.sendFile(path.join(__dirname, distPath, 'index.html'));
	});

	app.get('/master', auth, function (req, res) {
		res.sendFile(path.join(__dirname, distPath, 'master.html'));
	});

	app.get('/dashboard', function (req, res) {
		res.sendFile(path.join(__dirname, distPath, 'dashboard.html'));
	});

	/**
	* lets express handle json data
	*/
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));

	/**
	* Mounts API
	*/
	var voteAPI = require('./api/routes/votes');
	app.use('/api/vote', voteAPI);

	

}



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

var createHash = function(secret) {
	var cipher = crypto.createCipher('blowfish', secret);
	return(cipher.final('hex'));
};

var brown = '\033[33m',
	green = '\033[32m',
	reset = '\033[0m';

console.log( brown + "reveal.js:" + reset + " Multiplex running on port " + green + port + reset );