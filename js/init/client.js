/*
Reveal.initialize({
    controls: true,
    progress: true,
    history: true,
    center: true,

    theme: Reveal.getQueryHash().theme, // available themes are in /css/theme
    transition: Reveal.getQueryHash().transition || 'default', // default/cube/page/concave/zoom/linear/fade/none

    // Optional libraries used to extend on reveal.js
    dependencies: [
        //{ src: 'bower_components/reveal.js/lib/js/classList.js', condition: function() { return !document.body.classList; } },
        //{ src: 'bower_components/reveal.js/plugin/markdown/marked.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
        //{ src: 'bower_components/reveal.js/plugin/markdown/markdown.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
        //{ src: 'bower_components/reveal.js/plugin/highlight/highlight.js', async: true, callback: function() { hljs.initHighlightingOnLoad(); } },
        //{ src: 'bower_components/reveal.js/plugin/zoom-js/zoom.js', async: true, condition: function() { return !!document.body.classList; } },
        //{ src: 'bower_components/reveal.js/plugin/notes/notes.js', async: true, condition: function() { return !!document.body.classList; } },
        //{ src: 'bower_components/reveal.js/plugin/remotes/remotes.js', async: true, condition: function() { return !!document.body.classList; } },
        //{ src: 'js/loadhtmlslides.js', condition: function() { return !!document.querySelector( '[data-html]' ); } },
        { src: 'js/vote-machine.js', condition: function() { return !!document.querySelector( '[data-html]' ); } }
    ]
});
*/
(function(){

    var multiplex = socketConfig;
    var socketId = multiplex.id;
    var socket = io.connect(multiplex.server);
    var currentTopic = $("#current-topic");

    var allSlidesData;

    socket.on(multiplex.id, function(data) {

        // ignore data from sockets that aren't ours
        if (data.socketId !== socketId) { return; }
        if( window.location.host === 'localhost:1947' ) return;

        // Reveal.slide(data.indexh, data.indexv, data.indexf, 'remote');

        setFormData(data);

    });

    var testAnim = function (x) {
        $('#main form')
                .removeClass()
                .addClass(x + ' animated')
                .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                    $(this).removeClass();
                });
    };

    var getSlidesData = function(){
        return $.get('/slides/list.json');
    }

    var setFormData = function(currentSlide){
        
        var slide = !$.isArray(allSlidesData[currentSlide.indexh]) 
                            ? allSlidesData[currentSlide.indexh] : allSlidesData[currentSlide.indexh][currentSlide.indexv];

        console.log(slide);

        if(slide.data){
            currentTopic.text(slide.data.topic);
            testAnim("zoomInRight");
        }

    }

    var slideData = {
        secret: socketConfig.secret,
        socketId : socketId
    };

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