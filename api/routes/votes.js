var express = require('express');
var router = express.Router();
var voteRepo = require('../repos/vote');

var noCache = function(req, res, next){
	res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	res.header('Expires', '-1');
	res.header('Pragma', 'no-cache');
	next();
}

router.all('*', noCache);

/*  Get stats of vote for a single slide  */
router.get('/:slideH/:slideV/stats', function(req, res, next) {

	voteRepo
		.getSlideVoteStats(req.params.slideH + ':' + req.params.slideV, function(stats){
			res.send({'result':'OK', stats: stats});
		});

});

/*  Get global votes stats for all slides  */
router.get('/all/stats', function(req, res, next) {

	voteRepo
		.getGlobalSlidesVotesStats(function(stats){
		res.send(stats);
	});

});

/* Handle a vote for slide by a client */
router.post('/', function(req, res, next) {

	voteRepo
		.checkIfHasAlreadyVoted(req.ip, req.body.slide)
		.then(function(value){
  			if(value === 0) {
  				voteRepo.saveVote(req.body.slide, req.body.vote, {ip: req.ip}, function(){
					res.send({result: 'OK', msg:'Your vote has been registered.'});			
				});
  			} else {
				res.status(403).send({msg:'You have already voted for this slide.'});
  			}
		});
});

/* Check if a user has already voted for slide */
router.get('/:slideH/:slideV/check', function(req, res, next) {

	voteRepo
		.checkIfHasAlreadyVoted(req.ip, req.params.slideH + ':' + req.params.slideV)
		.then(function(value){
  			if(value === 0) {
  				res.send({ result: 'OK', msg: 'Your can vote for this slide.'});
  			} else {
  				res.send({ result: 'KO', msg: 'You have already voted for this slide.'});
  			}
		});
});

module.exports = router;