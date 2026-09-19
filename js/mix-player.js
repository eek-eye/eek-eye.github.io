/**
 * Mix folder — hidden autoplay (no UI), muted so browsers allow autoplay.
 * Add MP3s under Mix/ and list in MIX_TRACKS. Set audio.muted = false when you want sound (may require user gesture).
 */
(function () {
    'use strict';

    var MIX_FOLDER = 'Mix/';

    var MIX_TRACKS = [
        {
            file: 'OHH300, dgxmdza - Delicada ( (SPOTISAVER).mp3'
        }
        // { file: 'another.mp3' },
    ];

    function trackSrc(file) {
        return MIX_FOLDER + encodeURIComponent(file);
    }

    if (!MIX_TRACKS.length) {
        return;
    }

    var index = 0;
    var audio = document.createElement('audio');
    audio.muted = true;
    audio.setAttribute('playsinline', '');
    audio.setAttribute('preload', 'auto');
    audio.setAttribute('aria-hidden', 'true');
    audio.style.cssText = 'position:absolute;width:0;height:0;opacity:0;pointer-events:none;border:0;clip:rect(0,0,0,0)';
    audio.loop = MIX_TRACKS.length === 1;

    document.body.appendChild(audio);

    function load(i) {
        index = (i + MIX_TRACKS.length) % MIX_TRACKS.length;
        audio.src = trackSrc(MIX_TRACKS[index].file);
        audio.load();
    }

    function tryPlay() {
        var p = audio.play();
        if (p && typeof p.catch === 'function') {
            p.catch(function () {});
        }
    }

    audio.addEventListener('ended', function () {
        if (MIX_TRACKS.length > 1) {
            load(index + 1);
            tryPlay();
        }
    });

    audio.addEventListener('canplay', function onReady() {
        audio.removeEventListener('canplay', onReady);
        tryPlay();
    });

    window.addEventListener('load', function () {
        tryPlay();
    });

    load(0);
})();
