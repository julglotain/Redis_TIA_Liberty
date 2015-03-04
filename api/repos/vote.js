var redis = require('then-redis');
var client = redis.createClient();

module.exports = {

	checkIfHasAlreadyVoted: function(ip, slide, cb){

		return client.sismember('voted:' + slide, ip);

	},

	saveVote: function(slideCoord, vote, userData, cb){

		var hashKey = "slide:" + slideCoord + ":" + vote;

		client
			.hincrby("votes:by:slide", hashKey, 1)
			.then(function(){
				client
					.sadd("voted:" +  slideCoord, userData.ip)
					.then(cb);
			});

	},

	getSlideVoteStats: function(slideCoord, cb){

		client.multi();
		client.hget('votes:by:slide', 'slide:' + slideCoord + ':yes');
		client.scard('voted:' + slideCoord);
		client.exec().then(function(values){

			var stats = {};
			stats.nbVotes = values[1];
			stats.nbYes = (stats.nbVotes) ? values[0] : 0;
			stats.nbNo = (stats.nbVotes) ? (stats.nbVotes - stats.nbYes) : 0;
			cb(stats);

		});

	},

	getGlobalSlidesVotesStats: function(cb){

		// client
		//	.hget

	}

};