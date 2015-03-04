(function(){

    var multiplex = socketConfig;
    var socketId = multiplex.id;
    var socket = io.connect(multiplex.server.fromClient);
    var currentTopic = $("#current-topic"), voteBtnGroup = $("#vote-btn-group"),
        topicSlide = $('#main #topic-slide'), specialContent = $("#special-content"),
        msgAVote = $('#msg-a-vote');

    var allSlidesData, _currentSlide, lastSlideHIndex, lastSlideVIndex;

    var animate = function (el, animation, onceAnimationEnd) {

        if(!onceAnimationEnd){
            el.removeClass();
        }

        el.addClass(animation + ' animated')
            .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                if(onceAnimationEnd){
                    onceAnimationEnd.call();
                } else {
                    $(this).removeClass();
                }
            });
    };

    var getSlidesData = function(){
        return $.get('/slides/list.json');
    }

    var setFormData = function(currentSlide){
        
        if(!currentSlide)return;

        _currentSlide = currentSlide;

        var slide = !$.isArray(allSlidesData[currentSlide.indexh]) 
                            ? allSlidesData[currentSlide.indexh] : allSlidesData[currentSlide.indexh][currentSlide.indexv];

        if(slide.data){

            if(slide.data.topic){

                // set topic title
                currentTopic.show().html(slide.data.topic);

                // animate client form view
                if(lastSlideHIndex < currentSlide.indexh) {
                    animate(topicSlide, "zoomInRight");
                } else if(lastSlideHIndex === currentSlide.indexh) {
                    if(lastSlideVIndex < currentSlide.indexv)
                        animate(topicSlide, "zoomInUp");
                    else
                        animate(topicSlide, "zoomInDown");
                } else {
                    animate(topicSlide, "zoomInLeft");
                }

            } else {
                currentTopic.hide();
            }

            if(slide.data.specialContent){
                specialContent.html(slide.data.specialContent);
                specialContent.show();
            } else {
                specialContent.hide();
            }
            
        } else {
            currentTopic.hide();
            specialContent.hide();
        }

        if(slide.votable) {

            // first we check if user has already voted for the slide 
            $.get('/api/vote/' + currentSlide.indexh + '/' + currentSlide.indexv + '/check' + '?' + new Date().getTime())
                .success(function(data){

                    var hasAlreadyVoted = (data.result === 'OK') ? false : true;
                   
                    if(hasAlreadyVoted){
                        voteBtnGroup.hide();
                        msgAVote.show();
                    } else {
                        voteBtnGroup.show();
                        msgAVote.hide();
                    }
                    
                    lastSlideHIndex = currentSlide.indexh;
                    lastSlideVIndex = currentSlide.indexv;
                    
                });

        } else {

            voteBtnGroup.hide();
            msgAVote.hide();

        }
        
    }

    var handleVoteBtnClick = function(e){

        e.preventDefault();
        
        var vote = $(e.currentTarget).hasClass('vote-btn--yes') ? "yes" : "no";

        var data = {"slide": _currentSlide.indexh + ":" + _currentSlide.indexv, "vote": vote};

        var deffered = $.ajax({
            type: "POST",
            url: '/api/vote',
            data: JSON.stringify(data),
            contentType: 'application/json'
        });

        deffered.success(function(){
            voteBtnGroup.hide();
            msgAVote.show();
            var modal = $('<div class="notification-vote-success"><i class="fa fa-thumbs-o-up"></i></div>');
            modal.appendTo($('body'));
            animate(modal, 'bounceInDown', function(){});
            
            setTimeout(function(){
                animate(modal, 'fadeOutUp', function(){
                    modal.remove();
                });
            }, 3000);

        });

    }

    //  bind events
    $('.vote-btn').on('click', handleVoteBtnClick);

    // listen to socket events
    socket.on(multiplex.id, function(data) {

        if (data.socketId !== socketId) { return; }

        setFormData(data);

    });

    // get current master slide data 
    socket.emit('voterconnected', function(initSlideData){
        if(!allSlidesData){
            getSlidesData()
                .done(function(_slidesData){ 
                    allSlidesData = _slidesData;
                    setFormData(initSlideData);
                })
        } else {
            setFormData(initSlideData);
        }
    });

})();