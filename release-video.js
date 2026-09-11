(function () {
    'use strict';
    var frame = document.getElementById('shade-player');
    var film = document.getElementById('shade-film');
    if (!frame || !film) return;

    var player, ready = false, visible = false, entered = false;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var src = new URL(frame.src);
    src.searchParams.set('origin', window.location.origin);
    frame.src = src.toString();

    function caption(message) {
        var note = document.querySelector('.shade-caption');
        if (note && note.firstChild) note.firstChild.textContent = message + ' ';
    }

    function sync() {
        if (!ready) return;
        if (!visible || document.hidden) {
            player.pauseVideo();
            entered = false;
        } else if (!entered && !reducedMotion.matches) {
            // Every scroll-triggered start is silent; visitors can unmute manually.
            entered = true;
            player.mute();
            player.playVideo();
        }
    }

    function createPlayer() {
        if (player) return;
        player = new window.YT.Player('shade-player', {
            events: {
                onReady: function (event) {
                    player = event.target;
                    ready = true;
                    player.mute();
                    sync();
                },
                onAutoplayBlocked: function () {
                    caption('Live From LA · Tap play to watch; sound starts muted.');
                },
                onError: function () {
                    caption('The embedded video is unavailable here. You can still watch on YouTube.');
                }
            }
        });
    }

    var previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
        if (typeof previousReady === 'function') previousReady();
        createPlayer();
    };
    if (window.YT && window.YT.Player) createPlayer();
    else {
        var api = document.createElement('script');
        api.src = 'https://www.youtube.com/iframe_api';
        api.async = true;
        api.onerror = function () {
            caption('Automatic playback is unavailable. Use the player controls or watch on YouTube.');
        };
        document.head.appendChild(api);
    }

    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
            visible = entries[0].isIntersecting && entries[0].intersectionRatio >= .35;
            sync();
        }, { threshold: [0, .35] }).observe(film);
    }
    document.addEventListener('visibilitychange', sync);
    function motionChanged() {
        if (ready && reducedMotion.matches) player.pauseVideo();
    }
    if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', motionChanged);
    else if (reducedMotion.addListener) reducedMotion.addListener(motionChanged);
})();
