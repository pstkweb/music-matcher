(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"E:\\Documents\\IntellijProjects\\music-matcher\\app.js":[function(require,module,exports){
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
},{"./models/Chord.js":"E:\\Documents\\IntellijProjects\\music-matcher\\models\\Chord.js","./models/D3FifthCircle.js":"E:\\Documents\\IntellijProjects\\music-matcher\\models\\D3FifthCircle.js","./models/Utils.js":"E:\\Documents\\IntellijProjects\\music-matcher\\models\\Utils.js"}],"E:\\Documents\\IntellijProjects\\music-matcher\\models\\Chord.js":[function(require,module,exports){
/**
 * Create a chord from it's root note
 * @param note The root note of the chord
 * @constructor
 */
function Chord(note){
    this.tonic = note;

    // Generate the chord
    var minor = false;
    if (note.match(/.*m$/)) {
        minor = true;
    }

    note = Chord.chordToCycleChord(note);

    this.chord = [
        note, // Root
        Chord.prototype.SCALE[(Chord.prototype.SCALE.indexOf(note) + (minor ? 3 : 4)) % Chord.prototype.SCALE.length], // Third (minor or major)
        Chord.prototype.SCALE[(Chord.prototype.SCALE.indexOf(note) + 7) % Chord.prototype.SCALE.length] // Fifth
    ];
}

/**
 * Chromatic scale
 * @type {string[]}
 */
Chord.prototype.SCALE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
/**
 * Circle of fifth
 * @type {string[]}
 */
Chord.prototype.CYCLIC_SCALE = ["C", "G", "D", "A", "E", "B", "F#", "C#", "G#", "D#", "A#", "F"];

/**
 * Return each chord notes position on circle of fifth
 * @returns {Array} An array of coordinates to draw the triangle
 */
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

/**
 * Re arrange chord to get one in the chromatic scale
 * @param chord The chord to transform
 * @returns {*} The chord without alterations except sharp
 */
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

/**
 * Create a chord from a progression
 * @param root The root of the progression
 * @param degree The degree in this progression
 * @returns {Chord} A Chord
 */
Chord.fromProgressionDegree = function(root, degree){
    var sharp = (root.length > 1),
        intDegree = Chord.degreeToInt(degree),
        i = (Chord.prototype.SCALE.indexOf(root.charAt(0)) + (intDegree - 1) * 2 - (intDegree >= 4 ? 1 : 0)),
        note = Chord.prototype.SCALE[i % Chord.prototype.SCALE.length];

    if (sharp) {
        // Double diese
        if (note.length > 1) {
            note = Chord.prototype.SCALE[Chord.prototype.SCALE.indexOf(note) + 1];
        } else {
            note += "#";
        }
    }

    // Minor
    if (degree.match(/[iv]+/)) {
        note += "m";
    }

    return new Chord(note);
};

/**
 * Get the int value of progression roman number degrees
 * @param degree The roman number degree
 * @returns {*} The int value of it or null if not in scope
 */
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

/**
 * Get the tonic of that chord
 * @returns {*} The tonic (equals to the root) of the chord
 */
Chord.prototype.getTonic = function() {
    return this.tonic;
};

/**
 * Get the three notes of the chord
 * @returns {Array} The chord notes
 */
Chord.prototype.getChord = function() {
    return this.chord;
};

module.exports = Chord;
},{}],"E:\\Documents\\IntellijProjects\\music-matcher\\models\\D3FifthCircle.js":[function(require,module,exports){
var Utils = require("./Utils"),
    Chord = require("./Chord");

/**
 * Create a D3 vizualisation of the circle of fifth
 * @param The position of this circle in the page
 * @constructor
 */
function D3FifthCircle(position) {
    // Diatonic wheel
    this.svg = d3.select('.cercle-quintes[data-index="'+position+'"]')
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

    // Ticks
    axis.append("svg:line")
        .attr("x1", 1)
        .attr("y1", 0)
        .attr("x2", 5)
        .attr("y2", 0)
        .attr("stroke", "black");

    // Ticks label
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
            return D3FifthCircle.prototype.COLORS[i];
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

/**
 * Colors of notes on the circle of fifth
 * @type {string[]} Hexa colors of notes
 */
D3FifthCircle.prototype.COLORS = ["#bcdf3a", "#a00c08", "#1b9080", "#f88010", "#7f087c", "#f4f43c", "#700d46", "#148f34", "#fa0c0c", "#1c0d82", "#edf087", "#d81386"];

/**
 * Create transition from a chord to the given new one
 * @param newChord The chord to go to
 */
D3FifthCircle.prototype.chordTransition = function(newChord) {
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
        // First chord of the progression
        this.lastChord = newChord.getChordAsPoints();
    } else {
        // n+1 chord so we transform it to have the least movements
        this.lastChord = Utils.transform(this.lastChord, newChord.getChordAsPoints());
    }

    // Launch transition animation
    this.chord.transition()
        .attr("d", D3FifthCircle.drawChord(this.lastChord) + "Z")
        .attr("fill", this.chordToColor(newChord))
        .duration(500)
        .ease("linear");
};

/**
 * Get the color of a chord
 * @param chord The chord to draw
 * @returns {string} The hexa color
 */
D3FifthCircle.prototype.chordToColor = function(chord) {
    return this.COLORS[Chord.prototype.CYCLIC_SCALE.indexOf(Chord.chordToCycleChord(chord.getTonic()))];
};

/**
 * D3 line generator from given data
 */
D3FifthCircle.drawChord = d3.svg.line()
    .x(function(d){ return d.x; })
    .y(function(d){ return d.y; })
    .interpolate("linear");

module.exports = D3FifthCircle;
},{"./Chord":"E:\\Documents\\IntellijProjects\\music-matcher\\models\\Chord.js","./Utils":"E:\\Documents\\IntellijProjects\\music-matcher\\models\\Utils.js"}],"E:\\Documents\\IntellijProjects\\music-matcher\\models\\Utils.js":[function(require,module,exports){
function Utils(){}

/**
 * Transform an array of points to another with the least
 * points movements
 * @param a The array to transform
 * @param b The array wanted
 * @returns {*} An array transforming b to have the least movements
 * compared to a
 */
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

/**
 * Get the index of a point in an array
 * @param array The array to search in
 * @param point The point to find
 * @returns {number} The array index of the point, -1 if it is not found
 */
Utils.indexOfPoint = function (array, point) {
    for (var i=0; i<array.length; i++) {
        if (array[i].x == point.x && array[i].y == point.y) {
            return i;
        }
    }

    return -1;
};

/**
 * Return all sub-lists of the given list
 * @param array The list to process
 * @param chunkSize The size of sub-lists
 * @returns {Array} The list of sub-lists
 */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL1NwWWQzci9BcHBEYXRhL1JvYW1pbmcvbnBtL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiYXBwLmpzIiwibW9kZWxzL0Nob3JkLmpzIiwibW9kZWxzL0QzRmlmdGhDaXJjbGUuanMiLCJtb2RlbHMvVXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgQ2hvcmQgPSByZXF1aXJlKFwiLi9tb2RlbHMvQ2hvcmQuanNcIiksXHJcbiAgICBVdGlscyA9IHJlcXVpcmUoXCIuL21vZGVscy9VdGlscy5qc1wiKSxcclxuICAgIEQzRmlmdGhDaXJjbGUgPSByZXF1aXJlKFwiLi9tb2RlbHMvRDNGaWZ0aENpcmNsZS5qc1wiKSxcclxuICAgIGNlcmNsZXNRdWludGVzID0gW107XHJcblxyXG4kKGZ1bmN0aW9uKCl7XHJcbiAgICAvLyBIb21lcGFnZSBzZWFyY2ggZmllbGRcclxuICAgICQoJy51aS5zZWFyY2gnKS5zZWFyY2goe1xyXG4gICAgICAgIGFwaVNldHRpbmdzOiB7XHJcbiAgICAgICAgICAgIHVybDogJ3NlYXJjaC8/cT17cXVlcnl9J1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZXJyb3I6IHtcclxuICAgICAgICAgICAgc291cmNlICAgICAgOiAnSW1wb3NzaWJsZSBkZSByZWNoZXJjaGVyLicsXHJcbiAgICAgICAgICAgIG5vUmVzdWx0cyAgIDogJ1ZvdHJlIHJlY2hlcmNoZSBuXFwnYSByZXRvdXJuw6kgYXVjdW4gcsOpc3VsdGF0LicsXHJcbiAgICAgICAgICAgIHNlcnZlckVycm9yIDogJ0lsIHkgYSBldSB1biBwcm9ibMOobWUgbG9ycyBkZSBsXFwnaW50ZXJyb2dhdGlvbiBkdSBzZXJ2ZXVyLicsXHJcbiAgICAgICAgICAgIG1ldGhvZCAgICAgIDogJ0xcXCdhY3Rpb24gZGVtYW5kw6llIG5cXCdlc3QgcGFzIGTDqWZpbmllLidcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTb25nIHBhZ2UgdHJhbnNwb3NlIGRyb3Bkb3duXHJcbiAgICAkKCdzZWxlY3QudWkuZHJvcGRvd24nKS5kcm9wZG93bih7XHJcbiAgICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uKHZhbCwgcm9vdCl7XHJcbiAgICAgICAgICAgIC8vIENoYW5nZSByb290IGZvciBwcm9ncmVzc2lvblxyXG4gICAgICAgICAgICBwcm9ncmVzc2lvbnNbJCh0aGlzKS5kYXRhKFwiaW5kZXhcIildLnJvb3QgPSByb290O1xyXG5cclxuICAgICAgICAgICAgLy8gQ2hhbmdlIGNob3JkcyBpbiB0YWJsZVxyXG4gICAgICAgICAgICAkKHRoaXMpLnBhcmVudHMoJy5jb2x1bW4nKS5maXJzdCgpLmZpbmQoXCJ0YWJsZVwiKS5maXJzdCgpLmZpbmQoXCJ0Ym9keSA+IHRyXCIpLmVhY2goZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIHZhciBkZWdyZWUgPSAkKHRoaXMpLmZpbmQoXCJ0ZFwiKS5maXJzdCgpLnRleHQoKTtcclxuICAgICAgICAgICAgICAgICQodGhpcykuZmluZChcInRkXCIpLmxhc3QoKS50ZXh0KENob3JkLmZyb21Qcm9ncmVzc2lvbkRlZ3JlZShyb290LCBkZWdyZWUpLmdldFRvbmljKCkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTb25nIHBhZ2UgdHJhbnNwb3NlIHJlc2V0IGJ1dHRvblxyXG4gICAgJCgnLnJlc2V0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuICAgICAgICQodGhpcykucGFyZW50KCkuZmluZCgnLnVpLmRyb3Bkb3duJykuZHJvcGRvd24oJ3Jlc3RvcmUgZGVmYXVsdHMnKTtcclxuICAgIH0pO1xyXG5cclxuICAgICQoJy5jZXJjbGUtcXVpbnRlcycpLmVhY2goZnVuY3Rpb24oaSl7XHJcbiAgICAgICAgY2VyY2xlc1F1aW50ZXMucHVzaCh7XHJcbiAgICAgICAgICAgIGQzOiBuZXcgRDNGaWZ0aENpcmNsZShpKSxcclxuICAgICAgICAgICAgaW50ZXJ2YWw6IG51bGwsXHJcbiAgICAgICAgICAgIHByb2dyZXNzaW9uOiBwcm9ncmVzc2lvbnNbaV0ucHJvZ3Jlc3Npb24uc3BsaXQoXCIsXCIpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHZhciAkY29udGFpbmVyID0gJCh0aGlzKTtcclxuXHJcbiAgICAgICAgJCh0aGlzKS5maW5kKCcucGxheUJ0bicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICAgICAkY29udGFpbmVyLmZpbmQoJy5wbGF5QnRuLCAuc3RvcEJ0bicpLnRvZ2dsZUNsYXNzKFwiZGlzYWJsZWRcIik7XHJcblxyXG4gICAgICAgICAgICB2YXIgaW50ZXJ2YWwgPSBjZXJjbGVzUXVpbnRlc1tpXS5pbnRlcnZhbCxcclxuICAgICAgICAgICAgICAgIGQzID0gY2VyY2xlc1F1aW50ZXNbaV0uZDMsXHJcbiAgICAgICAgICAgICAgICByb290ID0gcHJvZ3Jlc3Npb25zW2ldLnJvb3QsXHJcbiAgICAgICAgICAgICAgICBwcm9ncmVzc2lvbiA9IGNlcmNsZXNRdWludGVzW2ldLnByb2dyZXNzaW9uO1xyXG5cclxuICAgICAgICAgICAgaWYgKGludGVydmFsID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIC8vIFNob3cgZmlyc3QgY2hvcmRcclxuICAgICAgICAgICAgICAgIHZhciBwbGF5ZWRDaG9yZCA9IENob3JkLmZyb21Qcm9ncmVzc2lvbkRlZ3JlZShyb290LCBwcm9ncmVzc2lvbi5zaGlmdCgpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAkY29udGFpbmVyLmZpbmQoJy5wbGF5ZWROb3RlJykudGV4dChwbGF5ZWRDaG9yZC5nZXRUb25pYygpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBkMy5jaG9yZFRyYW5zaXRpb24ocGxheWVkQ2hvcmQpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFJ1biBwcm9jZXNzXHJcbiAgICAgICAgICAgICAgICBjZXJjbGVzUXVpbnRlc1tpXS5pbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9ncmVzc2lvbi5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwbGF5ZWRDaG9yZCA9IENob3JkLmZyb21Qcm9ncmVzc2lvbkRlZ3JlZShyb290LCBwcm9ncmVzc2lvbi5zaGlmdCgpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRjb250YWluZXIuZmluZCgnLnBsYXllZE5vdGUnKS50ZXh0KHBsYXllZENob3JkLmdldFRvbmljKCkpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZDMuY2hvcmRUcmFuc2l0aW9uKHBsYXllZENob3JkKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGNlcmNsZXNRdWludGVzW2ldLmludGVydmFsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2VyY2xlc1F1aW50ZXNbaV0uaW50ZXJ2YWwgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZXJjbGVzUXVpbnRlc1tpXS5wcm9ncmVzc2lvbiA9IHByb2dyZXNzaW9uc1tpXS5wcm9ncmVzc2lvbi5zcGxpdChcIixcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBSZXNldCBVSVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLmZpbmQoJy5wbGF5ZWROb3RlJykudGV4dChcIi1cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRjb250YWluZXIuZmluZCgnLnBsYXlCdG4sIC5zdG9wQnRuJykudG9nZ2xlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZDMuY2hvcmRUcmFuc2l0aW9uKG51bGwpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIDIwMDApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQodGhpcykuZmluZChcIi5zdG9wQnRuXCIpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICAgICB2YXIgaW50ZXJ2YWwgPSBjZXJjbGVzUXVpbnRlc1tpXS5pbnRlcnZhbCxcclxuICAgICAgICAgICAgICAgIGQzID0gY2VyY2xlc1F1aW50ZXNbaV0uZDM7XHJcblxyXG4gICAgICAgICAgICBpZiAoaW50ZXJ2YWwgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICAgICBjZXJjbGVzUXVpbnRlc1tpXS5pbnRlcnZhbCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICBjZXJjbGVzUXVpbnRlc1tpXS5wcm9ncmVzc2lvbiA9IHByb2dyZXNzaW9uc1tpXS5wcm9ncmVzc2lvbi5zcGxpdChcIixcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gUmVzZXQgVUlcclxuICAgICAgICAgICAgICAgICRjb250YWluZXIuZmluZCgnLnBsYXllZE5vdGUnKS50ZXh0KFwiLVwiKTtcclxuICAgICAgICAgICAgICAgICRjb250YWluZXIuZmluZCgnLnBsYXlCdG4sIC5zdG9wQnRuJykudG9nZ2xlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgICAgICAgICAgIGQzLmNob3JkVHJhbnNpdGlvbihudWxsKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn0pOyIsIi8qKlxyXG4gKiBDcmVhdGUgYSBjaG9yZCBmcm9tIGl0J3Mgcm9vdCBub3RlXHJcbiAqIEBwYXJhbSBub3RlIFRoZSByb290IG5vdGUgb2YgdGhlIGNob3JkXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuZnVuY3Rpb24gQ2hvcmQobm90ZSl7XHJcbiAgICB0aGlzLnRvbmljID0gbm90ZTtcclxuXHJcbiAgICAvLyBHZW5lcmF0ZSB0aGUgY2hvcmRcclxuICAgIHZhciBtaW5vciA9IGZhbHNlO1xyXG4gICAgaWYgKG5vdGUubWF0Y2goLy4qbSQvKSkge1xyXG4gICAgICAgIG1pbm9yID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBub3RlID0gQ2hvcmQuY2hvcmRUb0N5Y2xlQ2hvcmQobm90ZSk7XHJcblxyXG4gICAgdGhpcy5jaG9yZCA9IFtcclxuICAgICAgICBub3RlLCAvLyBSb290XHJcbiAgICAgICAgQ2hvcmQucHJvdG90eXBlLlNDQUxFWyhDaG9yZC5wcm90b3R5cGUuU0NBTEUuaW5kZXhPZihub3RlKSArIChtaW5vciA/IDMgOiA0KSkgJSBDaG9yZC5wcm90b3R5cGUuU0NBTEUubGVuZ3RoXSwgLy8gVGhpcmQgKG1pbm9yIG9yIG1ham9yKVxyXG4gICAgICAgIENob3JkLnByb3RvdHlwZS5TQ0FMRVsoQ2hvcmQucHJvdG90eXBlLlNDQUxFLmluZGV4T2Yobm90ZSkgKyA3KSAlIENob3JkLnByb3RvdHlwZS5TQ0FMRS5sZW5ndGhdIC8vIEZpZnRoXHJcbiAgICBdO1xyXG59XHJcblxyXG4vKipcclxuICogQ2hyb21hdGljIHNjYWxlXHJcbiAqIEB0eXBlIHtzdHJpbmdbXX1cclxuICovXHJcbkNob3JkLnByb3RvdHlwZS5TQ0FMRSA9IFtcIkNcIiwgXCJDI1wiLCBcIkRcIiwgXCJEI1wiLCBcIkVcIiwgXCJGXCIsIFwiRiNcIiwgXCJHXCIsIFwiRyNcIiwgXCJBXCIsIFwiQSNcIiwgXCJCXCJdO1xyXG4vKipcclxuICogQ2lyY2xlIG9mIGZpZnRoXHJcbiAqIEB0eXBlIHtzdHJpbmdbXX1cclxuICovXHJcbkNob3JkLnByb3RvdHlwZS5DWUNMSUNfU0NBTEUgPSBbXCJDXCIsIFwiR1wiLCBcIkRcIiwgXCJBXCIsIFwiRVwiLCBcIkJcIiwgXCJGI1wiLCBcIkMjXCIsIFwiRyNcIiwgXCJEI1wiLCBcIkEjXCIsIFwiRlwiXTtcclxuXHJcbi8qKlxyXG4gKiBSZXR1cm4gZWFjaCBjaG9yZCBub3RlcyBwb3NpdGlvbiBvbiBjaXJjbGUgb2YgZmlmdGhcclxuICogQHJldHVybnMge0FycmF5fSBBbiBhcnJheSBvZiBjb29yZGluYXRlcyB0byBkcmF3IHRoZSB0cmlhbmdsZVxyXG4gKi9cclxuQ2hvcmQucHJvdG90eXBlLmdldENob3JkQXNQb2ludHMgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIHBvaW50cyA9IFtdO1xyXG4gICAgZm9yICh2YXIgaT0wOyBpPHRoaXMuY2hvcmQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBwb2ludHMucHVzaCh7XHJcbiAgICAgICAgICAgIHg6IHBhcnNlRmxvYXQoXHJcbiAgICAgICAgICAgICAgICAxNjAgKyAxMzAgKiBNYXRoLmNvcyhcclxuICAgICAgICAgICAgICAgICAgICBNYXRoLnJvdW5kKDM2MCAvIENob3JkLnByb3RvdHlwZS5DWUNMSUNfU0NBTEUubGVuZ3RoICogQ2hvcmQucHJvdG90eXBlLkNZQ0xJQ19TQ0FMRS5pbmRleE9mKHRoaXMuY2hvcmRbaV0pIC0gOTApICogTWF0aC5QSSAvIDE4MFxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICApLFxyXG4gICAgICAgICAgICB5OiBwYXJzZUZsb2F0KFxyXG4gICAgICAgICAgICAgICAgMTYwICsgMTMwICogTWF0aC5zaW4oXHJcbiAgICAgICAgICAgICAgICAgICAgTWF0aC5yb3VuZCgzNjAgLyBDaG9yZC5wcm90b3R5cGUuQ1lDTElDX1NDQUxFLmxlbmd0aCAqIENob3JkLnByb3RvdHlwZS5DWUNMSUNfU0NBTEUuaW5kZXhPZih0aGlzLmNob3JkW2ldKSAtIDkwKSAqIE1hdGguUEkgLyAxODBcclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBwb2ludHM7XHJcbn07XHJcblxyXG4vKipcclxuICogUmUgYXJyYW5nZSBjaG9yZCB0byBnZXQgb25lIGluIHRoZSBjaHJvbWF0aWMgc2NhbGVcclxuICogQHBhcmFtIGNob3JkIFRoZSBjaG9yZCB0byB0cmFuc2Zvcm1cclxuICogQHJldHVybnMgeyp9IFRoZSBjaG9yZCB3aXRob3V0IGFsdGVyYXRpb25zIGV4Y2VwdCBzaGFycFxyXG4gKi9cclxuQ2hvcmQuY2hvcmRUb0N5Y2xlQ2hvcmQgPSBmdW5jdGlvbihjaG9yZCkge1xyXG4gICAgdmFyIGN5Y2xlQ2hvcmQgPSBjaG9yZDtcclxuICAgIGlmIChjeWNsZUNob3JkLm1hdGNoKC8uKm0kLykpIHtcclxuICAgICAgICBjeWNsZUNob3JkID0gY3ljbGVDaG9yZC5zdWJzdHJpbmcoMCwgY3ljbGVDaG9yZC5sZW5ndGggLSAxKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoY3ljbGVDaG9yZC5tYXRjaCgvLi4jJC8pKSB7XHJcbiAgICAgICAgY3ljbGVDaG9yZCA9IGN5Y2xlQ2hvcmQuc3Vic3RyaW5nKDAsIGN5Y2xlQ2hvcmQubGVuZ3RoIC0gMSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGN5Y2xlQ2hvcmQ7XHJcbn07XHJcblxyXG4vKipcclxuICogQ3JlYXRlIGEgY2hvcmQgZnJvbSBhIHByb2dyZXNzaW9uXHJcbiAqIEBwYXJhbSByb290IFRoZSByb290IG9mIHRoZSBwcm9ncmVzc2lvblxyXG4gKiBAcGFyYW0gZGVncmVlIFRoZSBkZWdyZWUgaW4gdGhpcyBwcm9ncmVzc2lvblxyXG4gKiBAcmV0dXJucyB7Q2hvcmR9IEEgQ2hvcmRcclxuICovXHJcbkNob3JkLmZyb21Qcm9ncmVzc2lvbkRlZ3JlZSA9IGZ1bmN0aW9uKHJvb3QsIGRlZ3JlZSl7XHJcbiAgICB2YXIgc2hhcnAgPSAocm9vdC5sZW5ndGggPiAxKSxcclxuICAgICAgICBpbnREZWdyZWUgPSBDaG9yZC5kZWdyZWVUb0ludChkZWdyZWUpLFxyXG4gICAgICAgIGkgPSAoQ2hvcmQucHJvdG90eXBlLlNDQUxFLmluZGV4T2Yocm9vdC5jaGFyQXQoMCkpICsgKGludERlZ3JlZSAtIDEpICogMiAtIChpbnREZWdyZWUgPj0gNCA/IDEgOiAwKSksXHJcbiAgICAgICAgbm90ZSA9IENob3JkLnByb3RvdHlwZS5TQ0FMRVtpICUgQ2hvcmQucHJvdG90eXBlLlNDQUxFLmxlbmd0aF07XHJcblxyXG4gICAgaWYgKHNoYXJwKSB7XHJcbiAgICAgICAgLy8gRG91YmxlIGRpZXNlXHJcbiAgICAgICAgaWYgKG5vdGUubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICBub3RlID0gQ2hvcmQucHJvdG90eXBlLlNDQUxFW0Nob3JkLnByb3RvdHlwZS5TQ0FMRS5pbmRleE9mKG5vdGUpICsgMV07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbm90ZSArPSBcIiNcIjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTWlub3JcclxuICAgIGlmIChkZWdyZWUubWF0Y2goL1tpdl0rLykpIHtcclxuICAgICAgICBub3RlICs9IFwibVwiO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZXcgQ2hvcmQobm90ZSk7XHJcbn07XHJcblxyXG4vKipcclxuICogR2V0IHRoZSBpbnQgdmFsdWUgb2YgcHJvZ3Jlc3Npb24gcm9tYW4gbnVtYmVyIGRlZ3JlZXNcclxuICogQHBhcmFtIGRlZ3JlZSBUaGUgcm9tYW4gbnVtYmVyIGRlZ3JlZVxyXG4gKiBAcmV0dXJucyB7Kn0gVGhlIGludCB2YWx1ZSBvZiBpdCBvciBudWxsIGlmIG5vdCBpbiBzY29wZVxyXG4gKi9cclxuQ2hvcmQuZGVncmVlVG9JbnQgPSBmdW5jdGlvbihkZWdyZWUpe1xyXG4gICAgc3dpdGNoIChkZWdyZWUpIHtcclxuICAgICAgICBjYXNlICdJJzpcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgY2FzZSAnSUknOlxyXG4gICAgICAgIGNhc2UgJ2lpJzpcclxuICAgICAgICAgICAgcmV0dXJuIDI7XHJcbiAgICAgICAgY2FzZSAnSUlJJzpcclxuICAgICAgICBjYXNlICdpaWknOlxyXG4gICAgICAgICAgICByZXR1cm4gMztcclxuICAgICAgICBjYXNlICdJVic6XHJcbiAgICAgICAgICAgIHJldHVybiA0O1xyXG4gICAgICAgIGNhc2UgJ1YnOlxyXG4gICAgICAgICAgICByZXR1cm4gNTtcclxuICAgICAgICBjYXNlICdWSSc6XHJcbiAgICAgICAgY2FzZSAndmknOlxyXG4gICAgICAgICAgICByZXR1cm4gNjtcclxuICAgICAgICBjYXNlICdWSUknOlxyXG4gICAgICAgICAgICByZXR1cm4gNztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZXQgdGhlIHRvbmljIG9mIHRoYXQgY2hvcmRcclxuICogQHJldHVybnMgeyp9IFRoZSB0b25pYyAoZXF1YWxzIHRvIHRoZSByb290KSBvZiB0aGUgY2hvcmRcclxuICovXHJcbkNob3JkLnByb3RvdHlwZS5nZXRUb25pYyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudG9uaWM7XHJcbn07XHJcblxyXG4vKipcclxuICogR2V0IHRoZSB0aHJlZSBub3RlcyBvZiB0aGUgY2hvcmRcclxuICogQHJldHVybnMge0FycmF5fSBUaGUgY2hvcmQgbm90ZXNcclxuICovXHJcbkNob3JkLnByb3RvdHlwZS5nZXRDaG9yZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuY2hvcmQ7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENob3JkOyIsInZhciBVdGlscyA9IHJlcXVpcmUoXCIuL1V0aWxzXCIpLFxyXG4gICAgQ2hvcmQgPSByZXF1aXJlKFwiLi9DaG9yZFwiKTtcclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgYSBEMyB2aXp1YWxpc2F0aW9uIG9mIHRoZSBjaXJjbGUgb2YgZmlmdGhcclxuICogQHBhcmFtIFRoZSBwb3NpdGlvbiBvZiB0aGlzIGNpcmNsZSBpbiB0aGUgcGFnZVxyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcbmZ1bmN0aW9uIEQzRmlmdGhDaXJjbGUocG9zaXRpb24pIHtcclxuICAgIC8vIERpYXRvbmljIHdoZWVsXHJcbiAgICB0aGlzLnN2ZyA9IGQzLnNlbGVjdCgnLmNlcmNsZS1xdWludGVzW2RhdGEtaW5kZXg9XCInK3Bvc2l0aW9uKydcIl0nKVxyXG4gICAgICAgIC5hcHBlbmQoXCJzdmc6c3ZnXCIpXHJcbiAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCAzMjApXHJcbiAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgMzIwKTtcclxuXHJcbiAgICAvLyBEcmF3IGNpcmNsZVxyXG4gICAgdGhpcy5zdmcuYXBwZW5kKFwic3ZnOmNpcmNsZVwiKVxyXG4gICAgICAgIC5hdHRyKFwiY3lcIiwgMTYwKVxyXG4gICAgICAgIC5hdHRyKFwiY3hcIiwgMTYwKVxyXG4gICAgICAgIC5hdHRyKFwiclwiLCAxMzApXHJcbiAgICAgICAgLmF0dHIoXCJmaWxsXCIsIFwibm9uZVwiKVxyXG4gICAgICAgIC5hdHRyKFwic3Ryb2tlXCIsIFwiYmxhY2tcIik7XHJcblxyXG4gICAgLy8gRHJhdyBheGlzXHJcbiAgICB2YXIgYXhpcyA9IHRoaXMuc3ZnLmFwcGVuZChcInN2ZzpnXCIpXHJcbiAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImF4aXNcIilcclxuICAgICAgICAuc2VsZWN0QWxsKFwidGV4dC5sYWJlbFwiKVxyXG4gICAgICAgIC5kYXRhKENob3JkLnByb3RvdHlwZS5DWUNMSUNfU0NBTEUpXHJcbiAgICAgICAgLmVudGVyKClcclxuICAgICAgICAuYXBwZW5kKFwic3ZnOmdcIilcclxuICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBmdW5jdGlvbihkLCBpKXtcclxuICAgICAgICAgICAgcmV0dXJuIFwicm90YXRlKFwiICsgTWF0aC5yb3VuZCgzNjAgLyBDaG9yZC5wcm90b3R5cGUuQ1lDTElDX1NDQUxFLmxlbmd0aCAqIGkgLSA5MCkgKyBcIiwgMTYwLCAxNjApIHRyYW5zbGF0ZSgyOTAsIDE2MClcIjtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAvLyBUaWNrc1xyXG4gICAgYXhpcy5hcHBlbmQoXCJzdmc6bGluZVwiKVxyXG4gICAgICAgIC5hdHRyKFwieDFcIiwgMSlcclxuICAgICAgICAuYXR0cihcInkxXCIsIDApXHJcbiAgICAgICAgLmF0dHIoXCJ4MlwiLCA1KVxyXG4gICAgICAgIC5hdHRyKFwieTJcIiwgMClcclxuICAgICAgICAuYXR0cihcInN0cm9rZVwiLCBcImJsYWNrXCIpO1xyXG5cclxuICAgIC8vIFRpY2tzIGxhYmVsXHJcbiAgICBheGlzLmFwcGVuZChcInN2Zzp0ZXh0XCIpXHJcbiAgICAgICAgLnRleHQoZnVuY3Rpb24obm90ZSl7XHJcbiAgICAgICAgICAgIHJldHVybiBub3RlO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmF0dHIoXCJmb250LXdlaWdodFwiLCBcIjcwMFwiKVxyXG4gICAgICAgIC5hdHRyKFwieFwiLCBmdW5jdGlvbihkLCBpKXtcclxuICAgICAgICAgICAgaWYgKGkgPiAwICYmIGkgPCA2KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gODtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChpID4gNikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIC0odGhpcy5nZXRCQm94KCkud2lkdGggKyA4KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIC0odGhpcy5nZXRCQm94KCkud2lkdGggLyAyKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5hdHRyKFwieVwiLCBmdW5jdGlvbihkLCBpKXtcclxuICAgICAgICAgICAgaWYgKGkgPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIC04O1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGkgPiAzICYmIGkgPCA5KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRCQm94KCkuaGVpZ2h0O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5hdHRyKFwiZmlsbFwiLCBmdW5jdGlvbihkLCBpKXtcclxuICAgICAgICAgICAgcmV0dXJuIEQzRmlmdGhDaXJjbGUucHJvdG90eXBlLkNPTE9SU1tpXTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQsIGkpe1xyXG4gICAgICAgICAgICByZXR1cm4gXCJyb3RhdGUoXCIgKyBNYXRoLnJvdW5kKDkwIC0gMzYwIC8gQ2hvcmQucHJvdG90eXBlLkNZQ0xJQ19TQ0FMRS5sZW5ndGggKiBpKSArIFwiKVwiO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIC8vIFByZS1kcmF3IGNob3JkXHJcbiAgICB0aGlzLmNob3JkID0gdGhpcy5zdmcuYXBwZW5kKFwic3ZnOnBhdGhcIilcclxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiY2hvcmRcIilcclxuICAgICAgICAuYXR0cihcInN0cm9rZVwiLCBcIm5vbmVcIik7XHJcblxyXG4gICAgdGhpcy5sYXN0Q2hvcmQgPSBudWxsO1xyXG59XHJcblxyXG4vKipcclxuICogQ29sb3JzIG9mIG5vdGVzIG9uIHRoZSBjaXJjbGUgb2YgZmlmdGhcclxuICogQHR5cGUge3N0cmluZ1tdfSBIZXhhIGNvbG9ycyBvZiBub3Rlc1xyXG4gKi9cclxuRDNGaWZ0aENpcmNsZS5wcm90b3R5cGUuQ09MT1JTID0gW1wiI2JjZGYzYVwiLCBcIiNhMDBjMDhcIiwgXCIjMWI5MDgwXCIsIFwiI2Y4ODAxMFwiLCBcIiM3ZjA4N2NcIiwgXCIjZjRmNDNjXCIsIFwiIzcwMGQ0NlwiLCBcIiMxNDhmMzRcIiwgXCIjZmEwYzBjXCIsIFwiIzFjMGQ4MlwiLCBcIiNlZGYwODdcIiwgXCIjZDgxMzg2XCJdO1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSB0cmFuc2l0aW9uIGZyb20gYSBjaG9yZCB0byB0aGUgZ2l2ZW4gbmV3IG9uZVxyXG4gKiBAcGFyYW0gbmV3Q2hvcmQgVGhlIGNob3JkIHRvIGdvIHRvXHJcbiAqL1xyXG5EM0ZpZnRoQ2lyY2xlLnByb3RvdHlwZS5jaG9yZFRyYW5zaXRpb24gPSBmdW5jdGlvbihuZXdDaG9yZCkge1xyXG4gICAgLy8gUmVzZXQgdGhlIHZpZXdcclxuICAgIGlmIChuZXdDaG9yZCA9PSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5sYXN0Q2hvcmQgPSBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLmNob3JkLnRyYW5zaXRpb24oKVxyXG4gICAgICAgICAgICAuYXR0cihcImRcIiwgbnVsbClcclxuICAgICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIG51bGwpXHJcbiAgICAgICAgICAgIC5kdXJhdGlvbig1MDApXHJcbiAgICAgICAgICAgIC5lYXNlKFwibGluZWFyXCIpO1xyXG5cclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMubGFzdENob3JkID09IG51bGwpIHtcclxuICAgICAgICAvLyBGaXJzdCBjaG9yZCBvZiB0aGUgcHJvZ3Jlc3Npb25cclxuICAgICAgICB0aGlzLmxhc3RDaG9yZCA9IG5ld0Nob3JkLmdldENob3JkQXNQb2ludHMoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gbisxIGNob3JkIHNvIHdlIHRyYW5zZm9ybSBpdCB0byBoYXZlIHRoZSBsZWFzdCBtb3ZlbWVudHNcclxuICAgICAgICB0aGlzLmxhc3RDaG9yZCA9IFV0aWxzLnRyYW5zZm9ybSh0aGlzLmxhc3RDaG9yZCwgbmV3Q2hvcmQuZ2V0Q2hvcmRBc1BvaW50cygpKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBMYXVuY2ggdHJhbnNpdGlvbiBhbmltYXRpb25cclxuICAgIHRoaXMuY2hvcmQudHJhbnNpdGlvbigpXHJcbiAgICAgICAgLmF0dHIoXCJkXCIsIEQzRmlmdGhDaXJjbGUuZHJhd0Nob3JkKHRoaXMubGFzdENob3JkKSArIFwiWlwiKVxyXG4gICAgICAgIC5hdHRyKFwiZmlsbFwiLCB0aGlzLmNob3JkVG9Db2xvcihuZXdDaG9yZCkpXHJcbiAgICAgICAgLmR1cmF0aW9uKDUwMClcclxuICAgICAgICAuZWFzZShcImxpbmVhclwiKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZXQgdGhlIGNvbG9yIG9mIGEgY2hvcmRcclxuICogQHBhcmFtIGNob3JkIFRoZSBjaG9yZCB0byBkcmF3XHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBoZXhhIGNvbG9yXHJcbiAqL1xyXG5EM0ZpZnRoQ2lyY2xlLnByb3RvdHlwZS5jaG9yZFRvQ29sb3IgPSBmdW5jdGlvbihjaG9yZCkge1xyXG4gICAgcmV0dXJuIHRoaXMuQ09MT1JTW0Nob3JkLnByb3RvdHlwZS5DWUNMSUNfU0NBTEUuaW5kZXhPZihDaG9yZC5jaG9yZFRvQ3ljbGVDaG9yZChjaG9yZC5nZXRUb25pYygpKSldO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEQzIGxpbmUgZ2VuZXJhdG9yIGZyb20gZ2l2ZW4gZGF0YVxyXG4gKi9cclxuRDNGaWZ0aENpcmNsZS5kcmF3Q2hvcmQgPSBkMy5zdmcubGluZSgpXHJcbiAgICAueChmdW5jdGlvbihkKXsgcmV0dXJuIGQueDsgfSlcclxuICAgIC55KGZ1bmN0aW9uKGQpeyByZXR1cm4gZC55OyB9KVxyXG4gICAgLmludGVycG9sYXRlKFwibGluZWFyXCIpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBEM0ZpZnRoQ2lyY2xlOyIsImZ1bmN0aW9uIFV0aWxzKCl7fVxyXG5cclxuLyoqXHJcbiAqIFRyYW5zZm9ybSBhbiBhcnJheSBvZiBwb2ludHMgdG8gYW5vdGhlciB3aXRoIHRoZSBsZWFzdFxyXG4gKiBwb2ludHMgbW92ZW1lbnRzXHJcbiAqIEBwYXJhbSBhIFRoZSBhcnJheSB0byB0cmFuc2Zvcm1cclxuICogQHBhcmFtIGIgVGhlIGFycmF5IHdhbnRlZFxyXG4gKiBAcmV0dXJucyB7Kn0gQW4gYXJyYXkgdHJhbnNmb3JtaW5nIGIgdG8gaGF2ZSB0aGUgbGVhc3QgbW92ZW1lbnRzXHJcbiAqIGNvbXBhcmVkIHRvIGFcclxuICovXHJcblV0aWxzLnRyYW5zZm9ybSAgPSBmdW5jdGlvbihhLCBiKSB7XHJcbiAgICBpZiAoYi5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYS5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgIHJldHVybiBiO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEtlZXAgb25seSBjaGFuZ2VkIHZhbHVlcyBpbiBiIGFuZCB1bmNoYW5nZWQgdmFsdWVzIGluIGFcclxuICAgIGZvciAodmFyIGk9MDsgaTxhLmxlbmd0aDtpKyspe1xyXG4gICAgICAgIHZhciBwb3MgPSBVdGlscy5pbmRleE9mUG9pbnQoYiwgYVtpXSk7XHJcbiAgICAgICAgaWYgKHBvcyA9PSAtMSkge1xyXG4gICAgICAgICAgICBhW2ldID0gLTE7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYi5zcGxpY2UocG9zLCAxKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWRkIGNoYW5nZWQgdmFsdWVzIHRvIGFcclxuICAgIGZvciAodmFyIGo9MDsgajxhLmxlbmd0aDtqKyspIHtcclxuICAgICAgICBpZiAoYVtqXSA9PSAtMSkge1xyXG4gICAgICAgICAgICBhW2pdID0gYlswXTtcclxuICAgICAgICAgICAgYi5zcGxpY2UoMCwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBhO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdldCB0aGUgaW5kZXggb2YgYSBwb2ludCBpbiBhbiBhcnJheVxyXG4gKiBAcGFyYW0gYXJyYXkgVGhlIGFycmF5IHRvIHNlYXJjaCBpblxyXG4gKiBAcGFyYW0gcG9pbnQgVGhlIHBvaW50IHRvIGZpbmRcclxuICogQHJldHVybnMge251bWJlcn0gVGhlIGFycmF5IGluZGV4IG9mIHRoZSBwb2ludCwgLTEgaWYgaXQgaXMgbm90IGZvdW5kXHJcbiAqL1xyXG5VdGlscy5pbmRleE9mUG9pbnQgPSBmdW5jdGlvbiAoYXJyYXksIHBvaW50KSB7XHJcbiAgICBmb3IgKHZhciBpPTA7IGk8YXJyYXkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAoYXJyYXlbaV0ueCA9PSBwb2ludC54ICYmIGFycmF5W2ldLnkgPT0gcG9pbnQueSkge1xyXG4gICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIC0xO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJldHVybiBhbGwgc3ViLWxpc3RzIG9mIHRoZSBnaXZlbiBsaXN0XHJcbiAqIEBwYXJhbSBhcnJheSBUaGUgbGlzdCB0byBwcm9jZXNzXHJcbiAqIEBwYXJhbSBjaHVua1NpemUgVGhlIHNpemUgb2Ygc3ViLWxpc3RzXHJcbiAqIEByZXR1cm5zIHtBcnJheX0gVGhlIGxpc3Qgb2Ygc3ViLWxpc3RzXHJcbiAqL1xyXG5VdGlscy5zdWJMaXN0cyA9IGZ1bmN0aW9uKGFycmF5LCBjaHVua1NpemUpIHtcclxuICAgIGlmIChhcnJheS5sZW5ndGggPCBjaHVua1NpemUpXHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG5cclxuICAgIHZhciBuYkNodW5rcyA9IGFycmF5Lmxlbmd0aCAtIGNodW5rU2l6ZSArIDEsXHJcbiAgICAgICAgY2h1bmtzID0gW107XHJcbiAgICBmb3IgKHZhciBpPTA7IGk8bmJDaHVua3M7IGkrKykge1xyXG4gICAgICAgIGNodW5rcy5wdXNoKGFycmF5LnNsaWNlKGksIChpICsgY2h1bmtTaXplKSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjaHVua3M7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFV0aWxzOyJdfQ==
