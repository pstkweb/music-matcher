var Chord = require("./models/Chord.js"),
    Utils = require("./models/Utils.js"),
    D3FifthCircle = require("./models/D3FifthCircle.js"),
    cerclesQuintes = [];

$(function(){
    // Homepage search field
    $('.ui.search').search({
        apiSettings: {
            url: 'search/?q={query}'
        },
        error: {
            source      : 'Impossible de rechercher.',
            noResults   : 'Votre recherche n\'a retourné aucun résultat.',
            serverError : 'Il y a eu un problème lors de l\'interrogation du serveur.',
            method      : 'L\'action demandée n\'est pas définie.'
        }
    });

    // Song page transpose dropdown
    $('select.ui.dropdown').dropdown({
        onChange: function(val, root){
            // Change root for progression
            progressions[$(this).data("index")].root = root;

            // Change chords in table
            $(this).parents('.column').first().find("table").first().find("tbody > tr").each(function(){
                var degree = $(this).find("td").first().text();
                $(this).find("td").last().text(Chord.fromProgressionDegree(root, degree).getTonic());
            });
        }
    });

    // Song page transpose reset button
    $('.reset').on('click', function(){
       $(this).parent().find('.ui.dropdown').dropdown('restore defaults');
    });

    $('.cercle-quintes').each(function(i){
        cerclesQuintes.push({
            d3: new D3FifthCircle(i),
            interval: null,
            progression: progressions[i].progression.split(",")
        });

        var $container = $(this);

        $(this).find('.playBtn').on('click', function(e){
            $container.find('.playBtn, .stopBtn').toggleClass("disabled");

            var interval = cerclesQuintes[i].interval,
                d3 = cerclesQuintes[i].d3,
                root = progressions[i].root,
                progression = cerclesQuintes[i].progression;

            if (interval == null) {
                // Show first chord
                var playedChord = Chord.fromProgressionDegree(root, progression.shift());

                $container.find('.playedNote').text(playedChord.getTonic());

                d3.chordTransition(playedChord);

                // Run process
                cerclesQuintes[i].interval = setInterval(function() {
                    if (progression.length > 0) {
                        var playedChord = Chord.fromProgressionDegree(root, progression.shift());

                        $container.find('.playedNote').text(playedChord.getTonic());

                        d3.chordTransition(playedChord);
                    } else {
                        clearInterval(cerclesQuintes[i].interval);
                        cerclesQuintes[i].interval = null;
                        cerclesQuintes[i].progression = progressions[i].progression.split(",");

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
            var interval = cerclesQuintes[i].interval,
                d3 = cerclesQuintes[i].d3;

            if (interval != null) {
                clearInterval(interval);
                cerclesQuintes[i].interval = null;
                cerclesQuintes[i].progression = progressions[i].progression.split(",");

                // Reset UI
                $container.find('.playedNote').text("-");
                $container.find('.playBtn, .stopBtn').toggleClass("disabled");
                d3.chordTransition(null);
            }

            e.preventDefault();
        });
    });
});