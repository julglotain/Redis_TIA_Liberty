(function(){

    var multiplex = socketConfig;
    var socketId = multiplex.id;
    var socket = io.connect(multiplex.server.fromClient);
    var currentTopic = $("#current-topic"), voteBtnGroup = $("#vote-btn-group"),
        topicSlide = $('#main #topic-slide'), specialContent = $("#special-content");

    var allSlidesData, _currentSlide, lastSlideHIndex, lastSlideVIndex;

    var animate = function (el, animation) {
        el
            .removeClass()
            .addClass(animation + ' animated')
            .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                $(this).removeClass();
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
                currentTopic.show().text(slide.data.topic);

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

        // first we check if user has already voted for the slide 
        var deffered = $.get('/api/vote/' + currentSlide.indexh + '/' + currentSlide.indexv + '/check' + '?=' + new Date().getTime());
        deffered
            .success(function(data){

                var hasAlreadyVoted = (data.result === 'OK') ? false : true;
               
                if(hasAlreadyVoted || !slide.votable){
                    voteBtnGroup.hide();
                } else {
                    voteBtnGroup.show();
                }

                lastSlideHIndex = currentSlide.indexh;
                lastSlideVIndex = currentSlide.indexv;
                
            });
        
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

            // alert('¡¡ gracias por tu voto !!');
            // setFormData(_currentSlide);
            voteBtnGroup.hide();
            var modal = $('<div class="notification-vote-success">¡¡ muchas gracias !!</div>');
            modal.appendTo($('body'));

            setTimeout(function(){
                modal.remove();
                setFormData(_currentSlide);
            }, 2000);

        });
        /*
        deffered.error(function(){
            alert('muchas gracias para tu voto !!');
        });
        */
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