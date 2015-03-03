 Reveal.initialize({
    controls: true,
    progress: true,
    history: true,
    center: true,

    theme: Reveal.getQueryHash().theme, // available themes are in /css/theme
    transition: Reveal.getQueryHash().transition || 'default', // default/cube/page/concave/zoom/linear/fade/none

    multiplex: {
        // Example values. To generate your own, see the socket.io server instructions.
        id: socketConfig.id, // id, obtained from socket.io server
        secret: socketConfig.secret, // null so the clients do not have control of the master presentation
        url: socketConfig.server // Location of socket.io server
    },

    // Optional libraries used to extend on reveal.js
    dependencies: [
        { src: '../bower_components/reveal.js/lib/js/classList.js', condition: function() { return !document.body.classList; } },
        { src: '../bower_components/reveal.js/plugin/markdown/marked.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
        { src: '../bower_components/reveal.js/plugin/markdown/markdown.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
        { src: '../bower_components/reveal.js/plugin/highlight/highlight.js', async: true, callback: function() { hljs.initHighlightingOnLoad(); } },
        { src: '../bower_components/reveal.js/plugin/zoom-js/zoom.js', async: true, condition: function() { return !!document.body.classList; } },
        { src: '../bower_components/reveal.js/plugin/notes/notes.js', async: true, condition: function() { return !!document.body.classList; } },
        { src: '../js/multiplex/master.js', async: true },
        //{ src: 'bower_components/reveal.js/plugin/remotes/remotes.js', async: true, condition: function() { return !!document.body.classList; } },
        { src: '../js/loadhtmlslides.js', condition: function() { return !!document.querySelector( '[data-html]' ); } }
        
    ]
});

(function(){

    var positiveBar = $('.global-votes-tendency .positive'),
        negativeBar = $('.global-votes-tendency .negative'),
        lastPosPct = 50;

    setInterval(function(){

        var posPct = Math.random().toFixed(2) * 100;
        var negPct = 100 - posPct;

        if(posPct > lastPosPct){console.log("UP tendency")}else{console.log("DOWN tendency")}

        positiveBar.width(posPct + '%');
        negativeBar.width(negPct + '%');

        lastPosPct = posPct;

    }, 2000);

})();