var redis = require('then-redis');
var client = redis.createClient();

module.exports = {

	checkIfHasAlreadyVoted: function(ip, slide, cb){

		return client.sismember('voted:' + slide, ip);

	},

	saveVote: function(slideCoord, vote, userData, cb){

		var hashKey = "slide:" + slideCoord + ":" + vote;

		client
			// increment hash for single slide vote stats
			.hincrby("votes:by:slide", hashKey, 1)
			.then(function(){
				
				// increment global vote stats
				client.incr("votes:global:" + vote);

				client
					.sadd("voted:" +  slideCoord, userData.ip)
					.then(cb);
			});


	},

	getSlideVoteStats: function(slideCoord, cb){

		client.multi();

		// get number of positive votes for the slide
		client.hget('votes:by:slide', 'slide:' + slideCoord + ':yes');

		// get total number of votes for this slide
		client.hget('votes:by:slide', 'slide:' + slideCoord + ':no');

		client.exec().then(function(values){

			cb({
				yes: parseInt(values[0]) || 0,
				no: parseInt(values[1]) || 0
			});

		});

	},

	getGlobalSlidesVotesStats: function(cb){

		client.multi();
		client.get("votes:global:yes");
		client.get("votes:global:no");
		client.exec().then(function(reply){

			var yes = (reply[0]) ? parseInt(reply[0]) : 0;
			var no = (reply[1]) ? parseInt(reply[1]) : 0;
			var sum = yes + no;
			var pctYes = (sum !== 0) ? ((yes / sum) * 100) : 0;

			cb({
				total: sum,
				yes: (sum!==0) ? pctYes : 0,
				no: (sum!==0) ? (100 - pctYes) : 0
			});

		});

	}

};