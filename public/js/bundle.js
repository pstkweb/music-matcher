(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"E:\\Documents\\IntellijProjects\\music-matcher\\app.js":[function(require,module,exports){
var Chord = require("./models/Chord.js"),
    Utils = require("./models/Utils.js"),
    D3CyclicScale = require("./models/D3CyclicScale.js"),
    cerclesDiatoniques = [];

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
                        clearInterval(cerclesDiatoniques[i].interval);
                        cerclesDiatoniques[i].interval = null;
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
                cerclesDiatoniques[i].interval = null;
                cerclesDiatoniques[i].progression = progressions[i].progression.split(",");

                // Reset UI
                $container.find('.playedNote').text("-");
                $container.find('.playBtn, .stopBtn').toggleClass("disabled");
                d3.chordTransition(null);
            }

            e.preventDefault();
        });
    });
});
},{"./models/Chord.js":"E:\\Documents\\IntellijProjects\\music-matcher\\models\\Chord.js","./models/D3CyclicScale.js":"E:\\Documents\\IntellijProjects\\music-matcher\\models\\D3CyclicScale.js","./models/Utils.js":"E:\\Documents\\IntellijProjects\\music-matcher\\models\\Utils.js"}],"E:\\Documents\\IntellijProjects\\music-matcher\\models\\Chord.js":[function(require,module,exports){
function Chord(note){
    this.tonic = note;

    // Generate the chord
    var minor = false;
    if (note.match(/.*m$/)) {
        minor = true;
    }

    note = Chord.chordToCycleChord(note);

    this.chord = [
        note,
        Chord.prototype.SCALE[(Chord.prototype.SCALE.indexOf(note) + (minor ? 3 : 4)) % Chord.prototype.SCALE.length],
        Chord.prototype.SCALE[(Chord.prototype.SCALE.indexOf(note) + 7) % Chord.prototype.SCALE.length]
    ];
}

Chord.prototype.SCALE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
Chord.prototype.CYCLIC_SCALE = ["C", "G", "D", "A", "E", "B", "F#", "C#", "G#", "D#", "A#", "F"];

Chord.prototype.getChordAsPoints = function(){
    var points = [];
    for (var i=0; i<this.chord.length; i++) {
        points.push({
            x: parseFloat(
                160 + 130 * Math.cos(
                    Math.round(360 / Chord.prototype.CYCLIC_SCALE.length * Chord.prototype.CYCLIC_SCALE.indexOf(this.chord[i]) - 90) * Math.PI / 180
                )
            ),
            y: parseFloat(
                160 + 130 * Math.sin(
                    Math.round(360 / Chord.prototype.CYCLIC_SCALE.length * Chord.prototype.CYCLIC_SCALE.indexOf(this.chord[i]) - 90) * Math.PI / 180
                )
            )
        });
    }

    return points;
};

Chord.chordToCycleChord = function(chord) {
    var cycleChord = chord;
    if (cycleChord.match(/.*m$/)) {
        cycleChord = cycleChord.substring(0, cycleChord.length - 1);
    }

    if (cycleChord.match(/..#$/)) {
        cycleChord = cycleChord.substring(0, cycleChord.length - 1);
    }

    return cycleChord;
};

Chord.fromProgressionDegree = function(root, degree){
    var sharp = (root.length > 1),
        intDegree = Chord.degreeToInt(degree),
        i = (Chord.prototype.SCALE.indexOf(root.charAt(0)) + (intDegree - 1) * 2 - (intDegree >= 4 ? 1 : 0)),
        note = Chord.prototype.SCALE[i % Chord.prototype.SCALE.length];

    if (sharp) {
        // Double dièse
        if (note.length > 1) {
            note = Chord.prototype.SCALE[Chord.prototype.SCALE.indexOf(note) + 1];
        } else {
            note += "#";
        }
    }

    if (degree.match(/[iv]+/)) {
        note += "m";
    }

    return new Chord(note);
};

Chord.degreeToInt = function(degree){
    switch (degree) {
        case 'I':
            return 1;
        case 'II':
        case 'ii':
            return 2;
        case 'III':
        case 'iii':
            return 3;
        case 'IV':
            return 4;
        case 'V':
            return 5;
        case 'VI':
        case 'vi':
            return 6;
        case 'VII':
            return 7;
        default:
            return null;
    }
};

Chord.prototype.getTonic = function() {
    return this.tonic;
};

Chord.prototype.getChord = function() {
    return this.chord;
};

module.exports = Chord;
},{}],"E:\\Documents\\IntellijProjects\\music-matcher\\models\\D3CyclicScale.js":[function(require,module,exports){
var Utils = require("./Utils"),
    Chord = require("./Chord");

function D3CyclicScale(position) {
    // Diatonic wheel
    this.svg = d3.select('.cercle-diatonique[data-index="'+position+'"]')
        .append("svg:svg")
        .attr("width", 320)
        .attr("height", 320);

    // Draw circle
    this.svg.append("svg:circle")
        .attr("cy", 160)
        .attr("cx", 160)
        .attr("r", 130)
        .attr("fill", "none")
        .attr("stroke", "black");

    // Draw axis
    var axis = this.svg.append("svg:g")
        .attr("class", "axis")
        .selectAll("text.label")
        .data(Chord.prototype.CYCLIC_SCALE)
        .enter()
        .append("svg:g")
        .attr("transform", function(d, i){
            return "rotate(" + Math.round(360 / Chord.prototype.CYCLIC_SCALE.length * i - 90) + ", 160, 160) translate(290, 160)";
        });

    axis.append("svg:line")
        .attr("x1", 1)
        .attr("y1", 0)
        .attr("x2", 5)
        .attr("y2", 0)
        .attr("stroke", "black");

    axis.append("svg:text")
        .text(function(note){
            return note;
        })
        .attr("font-weight", "700")
        .attr("x", function(d, i){
            if (i > 0 && i < 6) {
                return 8;
            } else if (i > 6) {
                return -(this.getBBox().width + 8);
            }

            return -(this.getBBox().width / 2);
        })
        .attr("y", function(d, i){
            if (i == 0) {
                return -8;
            } else if (i > 3 && i < 9) {
                return this.getBBox().height;
            }

            return 0;
        })
        .attr("fill", function(d, i){
            return D3CyclicScale.prototype.COLORS[i];
        })
        .attr("transform", function(d, i){
            return "rotate(" + Math.round(90 - 360 / Chord.prototype.CYCLIC_SCALE.length * i) + ")";
        });

    // Pre-draw chord
    this.chord = this.svg.append("svg:path")
        .attr("class", "chord")
        .attr("stroke", "none");

    this.lastChord = null;
}

D3CyclicScale.prototype.COLORS = ["#bcdf3a", "#a00c08", "#1b9080", "#f88010", "#7f087c", "#f4f43c", "#700d46", "#148f34", "#fa0c0c", "#1c0d82", "#edf087", "#d81386"];

D3CyclicScale.prototype.chordTransition = function(newChord) {
    // Reset the view
    if (newChord == null) {
        this.lastChord = null;

        this.chord.transition()
            .attr("d", null)
            .attr("fill", null)
            .duration(500)
            .ease("linear");

        return;
    }

    if (this.lastChord == null) {
        this.lastChord = newChord.getChordAsPoints();
    } else {
        this.lastChord = Utils.transform(this.lastChord, newChord.getChordAsPoints());
    }

    this.chord.transition()
        .attr("d", D3CyclicScale.drawChord(this.lastChord) + "Z")
        .attr("fill", this.chordToColor(newChord))
        .duration(500)
        .ease("linear");
};

D3CyclicScale.prototype.chordToColor = function(chord) {
    return this.COLORS[Chord.prototype.CYCLIC_SCALE.indexOf(Chord.chordToCycleChord(chord.getTonic()))];
};

D3CyclicScale.drawChord = d3.svg.line()
    .x(function(d){ return d.x; })
    .y(function(d){ return d.y; })
    .interpolate("linear");

module.exports = D3CyclicScale;
},{"./Chord":"E:\\Documents\\IntellijProjects\\music-matcher\\models\\Chord.js","./Utils":"E:\\Documents\\IntellijProjects\\music-matcher\\models\\Utils.js"}],"E:\\Documents\\IntellijProjects\\music-matcher\\models\\Utils.js":[function(require,module,exports){
function Utils(){}

Utils.transform  = function(a, b) {
    if (b.length == 0) {
        return [];
    }

    if (a.length == 0) {
        return b;
    }

    // Keep only changed values in b and unchanged values in a
    for (var i=0; i<a.length;i++){
        var pos = Utils.indexOfPoint(b, a[i]);
        if (pos == -1) {
            a[i] = -1;
        } else {
            b.splice(pos, 1);
        }
    }

    // Add changed values to a
    for (var j=0; j<a.length;j++) {
        if (a[j] == -1) {
            a[j] = b[0];
            b.splice(0, 1);
        }
    }

    return a;
};

Utils.indexOfPoint = function (array, point) {
    for (var i=0; i<array.length; i++) {
        if (array[i].x == point.x && array[i].y == point.y) {
            return i;
        }
    }

    return -1;
};

Utils.subLists = function(array, chunkSize) {
    if (array.length < chunkSize)
        return [];

    var nbChunks = array.length - chunkSize + 1,
        chunks = [];
    for (var i=0; i<nbChunks; i++) {
        chunks.push(array.slice(i, (i + chunkSize)));
    }

    return chunks;
};

module.exports = Utils;
},{}]},{},["E:\\Documents\\IntellijProjects\\music-matcher\\app.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL1NwWWQzci9BcHBEYXRhL1JvYW1pbmcvbnBtL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiYXBwLmpzIiwibW9kZWxzL0Nob3JkLmpzIiwibW9kZWxzL0QzQ3ljbGljU2NhbGUuanMiLCJtb2RlbHMvVXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIENob3JkID0gcmVxdWlyZShcIi4vbW9kZWxzL0Nob3JkLmpzXCIpLFxyXG4gICAgVXRpbHMgPSByZXF1aXJlKFwiLi9tb2RlbHMvVXRpbHMuanNcIiksXHJcbiAgICBEM0N5Y2xpY1NjYWxlID0gcmVxdWlyZShcIi4vbW9kZWxzL0QzQ3ljbGljU2NhbGUuanNcIiksXHJcbiAgICBjZXJjbGVzRGlhdG9uaXF1ZXMgPSBbXTtcclxuXHJcbiQoZnVuY3Rpb24oKXtcclxuICAgIC8vIEhvbWVwYWdlIHNlYXJjaCBmaWVsZFxyXG4gICAgJCgnLnVpLnNlYXJjaCcpLnNlYXJjaCh7XHJcbiAgICAgICAgYXBpU2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgdXJsOiAnc2VhcmNoLz9xPXtxdWVyeX0nXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlcnJvcjoge1xyXG4gICAgICAgICAgICBzb3VyY2UgICAgICA6ICdJbXBvc3NpYmxlIGRlIHJlY2hlcmNoZXIuJyxcclxuICAgICAgICAgICAgbm9SZXN1bHRzICAgOiAnVm90cmUgcmVjaGVyY2hlIG5cXCdhIHJldG91cm7DqSBhdWN1biByw6lzdWx0YXQuJyxcclxuICAgICAgICAgICAgc2VydmVyRXJyb3IgOiAnSWwgeSBhIGV1IHVuIHByb2Jsw6htZSBsb3JzIGRlIGxcXCdpbnRlcnJvZ2F0aW9uIGR1IHNlcnZldXIuJyxcclxuICAgICAgICAgICAgbWV0aG9kICAgICAgOiAnTFxcJ2FjdGlvbiBkZW1hbmTDqWUgblxcJ2VzdCBwYXMgZMOpZmluaWUuJ1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNvbmcgcGFnZSB0cmFuc3Bvc2UgZHJvcGRvd25cclxuICAgICQoJ3NlbGVjdC51aS5kcm9wZG93bicpLmRyb3Bkb3duKHtcclxuICAgICAgICBvbkNoYW5nZTogZnVuY3Rpb24odmFsLCByb290KXtcclxuICAgICAgICAgICAgLy8gQ2hhbmdlIHJvb3QgZm9yIHByb2dyZXNzaW9uXHJcbiAgICAgICAgICAgIHByb2dyZXNzaW9uc1skKHRoaXMpLmRhdGEoXCJpbmRleFwiKV0ucm9vdCA9IHJvb3Q7XHJcblxyXG4gICAgICAgICAgICAvLyBDaGFuZ2UgY2hvcmRzIGluIHRhYmxlXHJcbiAgICAgICAgICAgICQodGhpcykucGFyZW50cygnLmNvbHVtbicpLmZpcnN0KCkuZmluZChcInRhYmxlXCIpLmZpcnN0KCkuZmluZChcInRib2R5ID4gdHJcIikuZWFjaChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgdmFyIGRlZ3JlZSA9ICQodGhpcykuZmluZChcInRkXCIpLmZpcnN0KCkudGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5maW5kKFwidGRcIikubGFzdCgpLnRleHQoQ2hvcmQuZnJvbVByb2dyZXNzaW9uRGVncmVlKHJvb3QsIGRlZ3JlZSkuZ2V0VG9uaWMoKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNvbmcgcGFnZSB0cmFuc3Bvc2UgcmVzZXQgYnV0dG9uXHJcbiAgICAkKCcucmVzZXQnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xyXG4gICAgICAgJCh0aGlzKS5wYXJlbnQoKS5maW5kKCcudWkuZHJvcGRvd24nKS5kcm9wZG93bigncmVzdG9yZSBkZWZhdWx0cycpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgJCgnLmNlcmNsZS1kaWF0b25pcXVlJykuZWFjaChmdW5jdGlvbihpKXtcclxuICAgICAgICBjZXJjbGVzRGlhdG9uaXF1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgIGQzOiBuZXcgRDNDeWNsaWNTY2FsZShpKSxcclxuICAgICAgICAgICAgaW50ZXJ2YWw6IG51bGwsXHJcbiAgICAgICAgICAgIHByb2dyZXNzaW9uOiBwcm9ncmVzc2lvbnNbaV0ucHJvZ3Jlc3Npb24uc3BsaXQoXCIsXCIpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHZhciAkY29udGFpbmVyID0gJCh0aGlzKTtcclxuXHJcbiAgICAgICAgJCh0aGlzKS5maW5kKCcucGxheUJ0bicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICAgICAkY29udGFpbmVyLmZpbmQoJy5wbGF5QnRuLCAuc3RvcEJ0bicpLnRvZ2dsZUNsYXNzKFwiZGlzYWJsZWRcIik7XHJcblxyXG4gICAgICAgICAgICB2YXIgaW50ZXJ2YWwgPSBjZXJjbGVzRGlhdG9uaXF1ZXNbaV0uaW50ZXJ2YWwsXHJcbiAgICAgICAgICAgICAgICBkMyA9IGNlcmNsZXNEaWF0b25pcXVlc1tpXS5kMyxcclxuICAgICAgICAgICAgICAgIHJvb3QgPSBwcm9ncmVzc2lvbnNbaV0ucm9vdCxcclxuICAgICAgICAgICAgICAgIHByb2dyZXNzaW9uID0gY2VyY2xlc0RpYXRvbmlxdWVzW2ldLnByb2dyZXNzaW9uO1xyXG5cclxuICAgICAgICAgICAgaWYgKGludGVydmFsID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIC8vIFNob3cgZmlyc3QgY2hvcmRcclxuICAgICAgICAgICAgICAgIHZhciBwbGF5ZWRDaG9yZCA9IENob3JkLmZyb21Qcm9ncmVzc2lvbkRlZ3JlZShyb290LCBwcm9ncmVzc2lvbi5zaGlmdCgpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAkY29udGFpbmVyLmZpbmQoJy5wbGF5ZWROb3RlJykudGV4dChwbGF5ZWRDaG9yZC5nZXRUb25pYygpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBkMy5jaG9yZFRyYW5zaXRpb24ocGxheWVkQ2hvcmQpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFJ1biBwcm9jZXNzXHJcbiAgICAgICAgICAgICAgICBjZXJjbGVzRGlhdG9uaXF1ZXNbaV0uaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJvZ3Jlc3Npb24ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGxheWVkQ2hvcmQgPSBDaG9yZC5mcm9tUHJvZ3Jlc3Npb25EZWdyZWUocm9vdCwgcHJvZ3Jlc3Npb24uc2hpZnQoKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLmZpbmQoJy5wbGF5ZWROb3RlJykudGV4dChwbGF5ZWRDaG9yZC5nZXRUb25pYygpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGQzLmNob3JkVHJhbnNpdGlvbihwbGF5ZWRDaG9yZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChjZXJjbGVzRGlhdG9uaXF1ZXNbaV0uaW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZXJjbGVzRGlhdG9uaXF1ZXNbaV0uaW50ZXJ2YWwgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZXJjbGVzRGlhdG9uaXF1ZXNbaV0ucHJvZ3Jlc3Npb24gPSBwcm9ncmVzc2lvbnNbaV0ucHJvZ3Jlc3Npb24uc3BsaXQoXCIsXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVzZXQgVUlcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGNvbnRhaW5lci5maW5kKCcucGxheWVkTm90ZScpLnRleHQoXCItXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLmZpbmQoJy5wbGF5QnRuLCAuc3RvcEJ0bicpLnRvZ2dsZUNsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGQzLmNob3JkVHJhbnNpdGlvbihudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCAyMDAwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkKHRoaXMpLmZpbmQoXCIuc3RvcEJ0blwiKS5vbignY2xpY2snLCBmdW5jdGlvbihlKXtcclxuICAgICAgICAgICAgdmFyIGludGVydmFsID0gY2VyY2xlc0RpYXRvbmlxdWVzW2ldLmludGVydmFsLFxyXG4gICAgICAgICAgICAgICAgZDMgPSBjZXJjbGVzRGlhdG9uaXF1ZXNbaV0uZDM7XHJcblxyXG4gICAgICAgICAgICBpZiAoaW50ZXJ2YWwgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICAgICBjZXJjbGVzRGlhdG9uaXF1ZXNbaV0uaW50ZXJ2YWwgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgY2VyY2xlc0RpYXRvbmlxdWVzW2ldLnByb2dyZXNzaW9uID0gcHJvZ3Jlc3Npb25zW2ldLnByb2dyZXNzaW9uLnNwbGl0KFwiLFwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBSZXNldCBVSVxyXG4gICAgICAgICAgICAgICAgJGNvbnRhaW5lci5maW5kKCcucGxheWVkTm90ZScpLnRleHQoXCItXCIpO1xyXG4gICAgICAgICAgICAgICAgJGNvbnRhaW5lci5maW5kKCcucGxheUJ0biwgLnN0b3BCdG4nKS50b2dnbGVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICAgICAgICAgICAgZDMuY2hvcmRUcmFuc2l0aW9uKG51bGwpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufSk7IiwiZnVuY3Rpb24gQ2hvcmQobm90ZSl7XHJcbiAgICB0aGlzLnRvbmljID0gbm90ZTtcclxuXHJcbiAgICAvLyBHZW5lcmF0ZSB0aGUgY2hvcmRcclxuICAgIHZhciBtaW5vciA9IGZhbHNlO1xyXG4gICAgaWYgKG5vdGUubWF0Y2goLy4qbSQvKSkge1xyXG4gICAgICAgIG1pbm9yID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBub3RlID0gQ2hvcmQuY2hvcmRUb0N5Y2xlQ2hvcmQobm90ZSk7XHJcblxyXG4gICAgdGhpcy5jaG9yZCA9IFtcclxuICAgICAgICBub3RlLFxyXG4gICAgICAgIENob3JkLnByb3RvdHlwZS5TQ0FMRVsoQ2hvcmQucHJvdG90eXBlLlNDQUxFLmluZGV4T2Yobm90ZSkgKyAobWlub3IgPyAzIDogNCkpICUgQ2hvcmQucHJvdG90eXBlLlNDQUxFLmxlbmd0aF0sXHJcbiAgICAgICAgQ2hvcmQucHJvdG90eXBlLlNDQUxFWyhDaG9yZC5wcm90b3R5cGUuU0NBTEUuaW5kZXhPZihub3RlKSArIDcpICUgQ2hvcmQucHJvdG90eXBlLlNDQUxFLmxlbmd0aF1cclxuICAgIF07XHJcbn1cclxuXHJcbkNob3JkLnByb3RvdHlwZS5TQ0FMRSA9IFtcIkNcIiwgXCJDI1wiLCBcIkRcIiwgXCJEI1wiLCBcIkVcIiwgXCJGXCIsIFwiRiNcIiwgXCJHXCIsIFwiRyNcIiwgXCJBXCIsIFwiQSNcIiwgXCJCXCJdO1xyXG5DaG9yZC5wcm90b3R5cGUuQ1lDTElDX1NDQUxFID0gW1wiQ1wiLCBcIkdcIiwgXCJEXCIsIFwiQVwiLCBcIkVcIiwgXCJCXCIsIFwiRiNcIiwgXCJDI1wiLCBcIkcjXCIsIFwiRCNcIiwgXCJBI1wiLCBcIkZcIl07XHJcblxyXG5DaG9yZC5wcm90b3R5cGUuZ2V0Q2hvcmRBc1BvaW50cyA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgcG9pbnRzID0gW107XHJcbiAgICBmb3IgKHZhciBpPTA7IGk8dGhpcy5jaG9yZC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHBvaW50cy5wdXNoKHtcclxuICAgICAgICAgICAgeDogcGFyc2VGbG9hdChcclxuICAgICAgICAgICAgICAgIDE2MCArIDEzMCAqIE1hdGguY29zKFxyXG4gICAgICAgICAgICAgICAgICAgIE1hdGgucm91bmQoMzYwIC8gQ2hvcmQucHJvdG90eXBlLkNZQ0xJQ19TQ0FMRS5sZW5ndGggKiBDaG9yZC5wcm90b3R5cGUuQ1lDTElDX1NDQUxFLmluZGV4T2YodGhpcy5jaG9yZFtpXSkgLSA5MCkgKiBNYXRoLlBJIC8gMTgwXHJcbiAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgIHk6IHBhcnNlRmxvYXQoXHJcbiAgICAgICAgICAgICAgICAxNjAgKyAxMzAgKiBNYXRoLnNpbihcclxuICAgICAgICAgICAgICAgICAgICBNYXRoLnJvdW5kKDM2MCAvIENob3JkLnByb3RvdHlwZS5DWUNMSUNfU0NBTEUubGVuZ3RoICogQ2hvcmQucHJvdG90eXBlLkNZQ0xJQ19TQ0FMRS5pbmRleE9mKHRoaXMuY2hvcmRbaV0pIC0gOTApICogTWF0aC5QSSAvIDE4MFxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHBvaW50cztcclxufTtcclxuXHJcbkNob3JkLmNob3JkVG9DeWNsZUNob3JkID0gZnVuY3Rpb24oY2hvcmQpIHtcclxuICAgIHZhciBjeWNsZUNob3JkID0gY2hvcmQ7XHJcbiAgICBpZiAoY3ljbGVDaG9yZC5tYXRjaCgvLiptJC8pKSB7XHJcbiAgICAgICAgY3ljbGVDaG9yZCA9IGN5Y2xlQ2hvcmQuc3Vic3RyaW5nKDAsIGN5Y2xlQ2hvcmQubGVuZ3RoIC0gMSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGN5Y2xlQ2hvcmQubWF0Y2goLy4uIyQvKSkge1xyXG4gICAgICAgIGN5Y2xlQ2hvcmQgPSBjeWNsZUNob3JkLnN1YnN0cmluZygwLCBjeWNsZUNob3JkLmxlbmd0aCAtIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjeWNsZUNob3JkO1xyXG59O1xyXG5cclxuQ2hvcmQuZnJvbVByb2dyZXNzaW9uRGVncmVlID0gZnVuY3Rpb24ocm9vdCwgZGVncmVlKXtcclxuICAgIHZhciBzaGFycCA9IChyb290Lmxlbmd0aCA+IDEpLFxyXG4gICAgICAgIGludERlZ3JlZSA9IENob3JkLmRlZ3JlZVRvSW50KGRlZ3JlZSksXHJcbiAgICAgICAgaSA9IChDaG9yZC5wcm90b3R5cGUuU0NBTEUuaW5kZXhPZihyb290LmNoYXJBdCgwKSkgKyAoaW50RGVncmVlIC0gMSkgKiAyIC0gKGludERlZ3JlZSA+PSA0ID8gMSA6IDApKSxcclxuICAgICAgICBub3RlID0gQ2hvcmQucHJvdG90eXBlLlNDQUxFW2kgJSBDaG9yZC5wcm90b3R5cGUuU0NBTEUubGVuZ3RoXTtcclxuXHJcbiAgICBpZiAoc2hhcnApIHtcclxuICAgICAgICAvLyBEb3VibGUgZGnDqHNlXHJcbiAgICAgICAgaWYgKG5vdGUubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICBub3RlID0gQ2hvcmQucHJvdG90eXBlLlNDQUxFW0Nob3JkLnByb3RvdHlwZS5TQ0FMRS5pbmRleE9mKG5vdGUpICsgMV07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbm90ZSArPSBcIiNcIjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGRlZ3JlZS5tYXRjaCgvW2l2XSsvKSkge1xyXG4gICAgICAgIG5vdGUgKz0gXCJtXCI7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG5ldyBDaG9yZChub3RlKTtcclxufTtcclxuXHJcbkNob3JkLmRlZ3JlZVRvSW50ID0gZnVuY3Rpb24oZGVncmVlKXtcclxuICAgIHN3aXRjaCAoZGVncmVlKSB7XHJcbiAgICAgICAgY2FzZSAnSSc6XHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIGNhc2UgJ0lJJzpcclxuICAgICAgICBjYXNlICdpaSc6XHJcbiAgICAgICAgICAgIHJldHVybiAyO1xyXG4gICAgICAgIGNhc2UgJ0lJSSc6XHJcbiAgICAgICAgY2FzZSAnaWlpJzpcclxuICAgICAgICAgICAgcmV0dXJuIDM7XHJcbiAgICAgICAgY2FzZSAnSVYnOlxyXG4gICAgICAgICAgICByZXR1cm4gNDtcclxuICAgICAgICBjYXNlICdWJzpcclxuICAgICAgICAgICAgcmV0dXJuIDU7XHJcbiAgICAgICAgY2FzZSAnVkknOlxyXG4gICAgICAgIGNhc2UgJ3ZpJzpcclxuICAgICAgICAgICAgcmV0dXJuIDY7XHJcbiAgICAgICAgY2FzZSAnVklJJzpcclxuICAgICAgICAgICAgcmV0dXJuIDc7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbn07XHJcblxyXG5DaG9yZC5wcm90b3R5cGUuZ2V0VG9uaWMgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLnRvbmljO1xyXG59O1xyXG5cclxuQ2hvcmQucHJvdG90eXBlLmdldENob3JkID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5jaG9yZDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2hvcmQ7IiwidmFyIFV0aWxzID0gcmVxdWlyZShcIi4vVXRpbHNcIiksXHJcbiAgICBDaG9yZCA9IHJlcXVpcmUoXCIuL0Nob3JkXCIpO1xyXG5cclxuZnVuY3Rpb24gRDNDeWNsaWNTY2FsZShwb3NpdGlvbikge1xyXG4gICAgLy8gRGlhdG9uaWMgd2hlZWxcclxuICAgIHRoaXMuc3ZnID0gZDMuc2VsZWN0KCcuY2VyY2xlLWRpYXRvbmlxdWVbZGF0YS1pbmRleD1cIicrcG9zaXRpb24rJ1wiXScpXHJcbiAgICAgICAgLmFwcGVuZChcInN2ZzpzdmdcIilcclxuICAgICAgICAuYXR0cihcIndpZHRoXCIsIDMyMClcclxuICAgICAgICAuYXR0cihcImhlaWdodFwiLCAzMjApO1xyXG5cclxuICAgIC8vIERyYXcgY2lyY2xlXHJcbiAgICB0aGlzLnN2Zy5hcHBlbmQoXCJzdmc6Y2lyY2xlXCIpXHJcbiAgICAgICAgLmF0dHIoXCJjeVwiLCAxNjApXHJcbiAgICAgICAgLmF0dHIoXCJjeFwiLCAxNjApXHJcbiAgICAgICAgLmF0dHIoXCJyXCIsIDEzMClcclxuICAgICAgICAuYXR0cihcImZpbGxcIiwgXCJub25lXCIpXHJcbiAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgXCJibGFja1wiKTtcclxuXHJcbiAgICAvLyBEcmF3IGF4aXNcclxuICAgIHZhciBheGlzID0gdGhpcy5zdmcuYXBwZW5kKFwic3ZnOmdcIilcclxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiYXhpc1wiKVxyXG4gICAgICAgIC5zZWxlY3RBbGwoXCJ0ZXh0LmxhYmVsXCIpXHJcbiAgICAgICAgLmRhdGEoQ2hvcmQucHJvdG90eXBlLkNZQ0xJQ19TQ0FMRSlcclxuICAgICAgICAuZW50ZXIoKVxyXG4gICAgICAgIC5hcHBlbmQoXCJzdmc6Z1wiKVxyXG4gICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQsIGkpe1xyXG4gICAgICAgICAgICByZXR1cm4gXCJyb3RhdGUoXCIgKyBNYXRoLnJvdW5kKDM2MCAvIENob3JkLnByb3RvdHlwZS5DWUNMSUNfU0NBTEUubGVuZ3RoICogaSAtIDkwKSArIFwiLCAxNjAsIDE2MCkgdHJhbnNsYXRlKDI5MCwgMTYwKVwiO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIGF4aXMuYXBwZW5kKFwic3ZnOmxpbmVcIilcclxuICAgICAgICAuYXR0cihcIngxXCIsIDEpXHJcbiAgICAgICAgLmF0dHIoXCJ5MVwiLCAwKVxyXG4gICAgICAgIC5hdHRyKFwieDJcIiwgNSlcclxuICAgICAgICAuYXR0cihcInkyXCIsIDApXHJcbiAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgXCJibGFja1wiKTtcclxuXHJcbiAgICBheGlzLmFwcGVuZChcInN2Zzp0ZXh0XCIpXHJcbiAgICAgICAgLnRleHQoZnVuY3Rpb24obm90ZSl7XHJcbiAgICAgICAgICAgIHJldHVybiBub3RlO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmF0dHIoXCJmb250LXdlaWdodFwiLCBcIjcwMFwiKVxyXG4gICAgICAgIC5hdHRyKFwieFwiLCBmdW5jdGlvbihkLCBpKXtcclxuICAgICAgICAgICAgaWYgKGkgPiAwICYmIGkgPCA2KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gODtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChpID4gNikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIC0odGhpcy5nZXRCQm94KCkud2lkdGggKyA4KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIC0odGhpcy5nZXRCQm94KCkud2lkdGggLyAyKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5hdHRyKFwieVwiLCBmdW5jdGlvbihkLCBpKXtcclxuICAgICAgICAgICAgaWYgKGkgPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIC04O1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGkgPiAzICYmIGkgPCA5KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRCQm94KCkuaGVpZ2h0O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5hdHRyKFwiZmlsbFwiLCBmdW5jdGlvbihkLCBpKXtcclxuICAgICAgICAgICAgcmV0dXJuIEQzQ3ljbGljU2NhbGUucHJvdG90eXBlLkNPTE9SU1tpXTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQsIGkpe1xyXG4gICAgICAgICAgICByZXR1cm4gXCJyb3RhdGUoXCIgKyBNYXRoLnJvdW5kKDkwIC0gMzYwIC8gQ2hvcmQucHJvdG90eXBlLkNZQ0xJQ19TQ0FMRS5sZW5ndGggKiBpKSArIFwiKVwiO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIC8vIFByZS1kcmF3IGNob3JkXHJcbiAgICB0aGlzLmNob3JkID0gdGhpcy5zdmcuYXBwZW5kKFwic3ZnOnBhdGhcIilcclxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiY2hvcmRcIilcclxuICAgICAgICAuYXR0cihcInN0cm9rZVwiLCBcIm5vbmVcIik7XHJcblxyXG4gICAgdGhpcy5sYXN0Q2hvcmQgPSBudWxsO1xyXG59XHJcblxyXG5EM0N5Y2xpY1NjYWxlLnByb3RvdHlwZS5DT0xPUlMgPSBbXCIjYmNkZjNhXCIsIFwiI2EwMGMwOFwiLCBcIiMxYjkwODBcIiwgXCIjZjg4MDEwXCIsIFwiIzdmMDg3Y1wiLCBcIiNmNGY0M2NcIiwgXCIjNzAwZDQ2XCIsIFwiIzE0OGYzNFwiLCBcIiNmYTBjMGNcIiwgXCIjMWMwZDgyXCIsIFwiI2VkZjA4N1wiLCBcIiNkODEzODZcIl07XHJcblxyXG5EM0N5Y2xpY1NjYWxlLnByb3RvdHlwZS5jaG9yZFRyYW5zaXRpb24gPSBmdW5jdGlvbihuZXdDaG9yZCkge1xyXG4gICAgLy8gUmVzZXQgdGhlIHZpZXdcclxuICAgIGlmIChuZXdDaG9yZCA9PSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5sYXN0Q2hvcmQgPSBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLmNob3JkLnRyYW5zaXRpb24oKVxyXG4gICAgICAgICAgICAuYXR0cihcImRcIiwgbnVsbClcclxuICAgICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIG51bGwpXHJcbiAgICAgICAgICAgIC5kdXJhdGlvbig1MDApXHJcbiAgICAgICAgICAgIC5lYXNlKFwibGluZWFyXCIpO1xyXG5cclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMubGFzdENob3JkID09IG51bGwpIHtcclxuICAgICAgICB0aGlzLmxhc3RDaG9yZCA9IG5ld0Nob3JkLmdldENob3JkQXNQb2ludHMoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5sYXN0Q2hvcmQgPSBVdGlscy50cmFuc2Zvcm0odGhpcy5sYXN0Q2hvcmQsIG5ld0Nob3JkLmdldENob3JkQXNQb2ludHMoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jaG9yZC50cmFuc2l0aW9uKClcclxuICAgICAgICAuYXR0cihcImRcIiwgRDNDeWNsaWNTY2FsZS5kcmF3Q2hvcmQodGhpcy5sYXN0Q2hvcmQpICsgXCJaXCIpXHJcbiAgICAgICAgLmF0dHIoXCJmaWxsXCIsIHRoaXMuY2hvcmRUb0NvbG9yKG5ld0Nob3JkKSlcclxuICAgICAgICAuZHVyYXRpb24oNTAwKVxyXG4gICAgICAgIC5lYXNlKFwibGluZWFyXCIpO1xyXG59O1xyXG5cclxuRDNDeWNsaWNTY2FsZS5wcm90b3R5cGUuY2hvcmRUb0NvbG9yID0gZnVuY3Rpb24oY2hvcmQpIHtcclxuICAgIHJldHVybiB0aGlzLkNPTE9SU1tDaG9yZC5wcm90b3R5cGUuQ1lDTElDX1NDQUxFLmluZGV4T2YoQ2hvcmQuY2hvcmRUb0N5Y2xlQ2hvcmQoY2hvcmQuZ2V0VG9uaWMoKSkpXTtcclxufTtcclxuXHJcbkQzQ3ljbGljU2NhbGUuZHJhd0Nob3JkID0gZDMuc3ZnLmxpbmUoKVxyXG4gICAgLngoZnVuY3Rpb24oZCl7IHJldHVybiBkLng7IH0pXHJcbiAgICAueShmdW5jdGlvbihkKXsgcmV0dXJuIGQueTsgfSlcclxuICAgIC5pbnRlcnBvbGF0ZShcImxpbmVhclwiKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRDNDeWNsaWNTY2FsZTsiLCJmdW5jdGlvbiBVdGlscygpe31cclxuXHJcblV0aWxzLnRyYW5zZm9ybSAgPSBmdW5jdGlvbihhLCBiKSB7XHJcbiAgICBpZiAoYi5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYS5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgIHJldHVybiBiO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEtlZXAgb25seSBjaGFuZ2VkIHZhbHVlcyBpbiBiIGFuZCB1bmNoYW5nZWQgdmFsdWVzIGluIGFcclxuICAgIGZvciAodmFyIGk9MDsgaTxhLmxlbmd0aDtpKyspe1xyXG4gICAgICAgIHZhciBwb3MgPSBVdGlscy5pbmRleE9mUG9pbnQoYiwgYVtpXSk7XHJcbiAgICAgICAgaWYgKHBvcyA9PSAtMSkge1xyXG4gICAgICAgICAgICBhW2ldID0gLTE7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYi5zcGxpY2UocG9zLCAxKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWRkIGNoYW5nZWQgdmFsdWVzIHRvIGFcclxuICAgIGZvciAodmFyIGo9MDsgajxhLmxlbmd0aDtqKyspIHtcclxuICAgICAgICBpZiAoYVtqXSA9PSAtMSkge1xyXG4gICAgICAgICAgICBhW2pdID0gYlswXTtcclxuICAgICAgICAgICAgYi5zcGxpY2UoMCwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBhO1xyXG59O1xyXG5cclxuVXRpbHMuaW5kZXhPZlBvaW50ID0gZnVuY3Rpb24gKGFycmF5LCBwb2ludCkge1xyXG4gICAgZm9yICh2YXIgaT0wOyBpPGFycmF5Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKGFycmF5W2ldLnggPT0gcG9pbnQueCAmJiBhcnJheVtpXS55ID09IHBvaW50LnkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiAtMTtcclxufTtcclxuXHJcblV0aWxzLnN1Ykxpc3RzID0gZnVuY3Rpb24oYXJyYXksIGNodW5rU2l6ZSkge1xyXG4gICAgaWYgKGFycmF5Lmxlbmd0aCA8IGNodW5rU2l6ZSlcclxuICAgICAgICByZXR1cm4gW107XHJcblxyXG4gICAgdmFyIG5iQ2h1bmtzID0gYXJyYXkubGVuZ3RoIC0gY2h1bmtTaXplICsgMSxcclxuICAgICAgICBjaHVua3MgPSBbXTtcclxuICAgIGZvciAodmFyIGk9MDsgaTxuYkNodW5rczsgaSsrKSB7XHJcbiAgICAgICAgY2h1bmtzLnB1c2goYXJyYXkuc2xpY2UoaSwgKGkgKyBjaHVua1NpemUpKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNodW5rcztcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVXRpbHM7Il19
