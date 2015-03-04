var Chord = require("./models/Chord.js"),
    Utils = require("./models/Utils.js"),
    D3CyclicScale = require("./models/D3CyclicScale.js"),
    cerclesDiatoniques = [];

$(function(){
    $('.cercle-diatonique').each(function(i){
        cerclesDiatoniques.push({
            d3: new D3CyclicScale(i),
            interval: null,
            progression: progressions[i].progression.split(",")
        });

        var $container = $(this);

        $(this).find('.playBtn').on('click', function(e){
            $container.find('.playBtn, .stopBtn').toggleClass("disabled");

            var interval = cerclesDiatoniques[i].interval,
                d3 = cerclesDiatoniques[i].d3,
                root = progressions[i].root,
                progression = cerclesDiatoniques[i].progression;

            if (interval == null) {
                // Show first chord
                var playedChord = Chord.fromProgressionDegree(root, progression.shift());

                $container.find('.playedNote').text(playedChord.getTonic());

                d3.chordTransition(playedChord);

                // Run process
                cerclesDiatoniques[i].interval = setInterval(function() {
                    if (progression.length > 0) {
                        var playedChord = Chord.fromProgressionDegree(root, progression.shift());

                        $container.find('.playedNote').text(playedChord.getTonic());

                        d3.chordTransition(playedChord);
                    } else {
                        clearInterval(interval);
                        cerclesDiatoniques[i].progression = progressions[i].progression.split(",");

                        // Reset UI
                        $container.find('.playedNote').text("-");
                        $container.find('.playBtn, .stopBtn').toggleClass("disabled");
                        d3.chordTransition(null);
                    }
                }, 2000);
            }

            e.preventDefault();
        });

        $(this).find(".stopBtn").on('click', function(e){
            var interval = cerclesDiatoniques[i].interval,
                d3 = cerclesDiatoniques[i].d3;

            if (interval != null) {
                clearInterval(interval);
                cerclesDiatoniques[i].progression = progressions[i].progression.split(",");

                // Reset UI
                $container.find('.playedNote').text("-");
                $container.find('.playBtn, .stopBtn').toggleClass("disabled");
                d3.chordTransition(null);
            }

            e.preventDefault();
        })
    });
});