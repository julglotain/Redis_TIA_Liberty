// Modified from markdown.js from Hakim to handle external html files
(function(){
    /*jslint loopfunc: true, browser: true*/
    /*globals alert*/
    'use strict';

	Reveal.addEventListener('ready', function( event ){
	    
	    // event.currentSlide, event.indexh, event.indexv

	    // register vote buttons handler

	    var voteFormTpl = '<form class="vote-form">' +
							'<button class="vote-btn vote-btn--yes">YES</button><button class="vote-btn vote-btn--no">NO</button>' +
						'</form>';

		// process votable slide and add vote machine support
		$('.slides section[data-votable]')
			.each(function(idx, votableSlide){

				$(votableSlide).append(voteFormTpl);

			});

		function getCurrentUser(){
			return localStorage.getItem('current-user');
		}

	    $('.slides section .vote-btn')
	    	.on('click', function(e){

	    		e.preventDefault();

	    		var currentSlide = Reveal.getCurrentSlide();

	    		var isPositiveVote = $(e.currentTarget).hasClass('vote-btn--yes');

	    		console.log("User: " + getCurrentUser() + " voted " +  ((isPositiveVote) ? "positively" : "negatively") + " for the slide '" + $(currentSlide).data('slide-topic') + "'.");

	    	});



	});

})();