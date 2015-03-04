var redis = require('redis');
var config = require('./config');
var client = redis.createClient();

var RedisRepo = function(){
	this.client = client;
}

module.exports = RedisRepo;