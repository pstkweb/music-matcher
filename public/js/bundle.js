(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"E:\\Documents\\IntellijProjects\\music-matcher\\app.js":[function(require,module,exports){
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
},{"./models/Chord.js":"E:\\Documents\\IntellijProjects\\music-matcher\\models\\Chord.js","./models/D3CyclicScale.js":"E:\\Documents\\IntellijProjects\\music-matcher\\models\\D3CyclicScale.js","./models/Utils.js":"E:\\Documents\\IntellijProjects\\music-matcher\\models\\Utils.js"}],"E:\\Documents\\IntellijProjects\\music-matcher\\models\\Chord.js":[function(require,module,exports){
var D3CyclicScale = require("./D3CyclicScale.js");

function Chord(note){
    this.tonic = note;

    // Generate the chord
    var minor = false;
    if (note.match(/.*m$/)) {
        minor = true;
    }

    note = D3CyclicScale.chordToCycleChord(note);

    this.chord = [
        note,
        Chord.prototype.SCALE[(Chord.prototype.SCALE.indexOf(note) + (minor ? 3 : 4)) % Chord.prototype.SCALE.length],
        Chord.prototype.SCALE[(Chord.prototype.SCALE.indexOf(note) + 7) % Chord.prototype.SCALE.length]
    ];
}

Chord.prototype.SCALE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

Chord.prototype.getTonic = function() {
    return this.tonic;
};

Chord.prototype.getChord = function() {
    return this.chord;
};

Chord.prototype.getChordAsPoints = function(){
    var points = [];
    for (var i=0; i<this.chord.length; i++) {
        points.push({
            x: parseFloat(
                160 + 130 * Math.cos(
                    Math.round(360 / D3CyclicScale.prototype.CYCLIC_SCALE.length * D3CyclicScale.prototype.CYCLIC_SCALE.indexOf(this.chord[i]) - 90) * Math.PI / 180
                )
            ),
            y: parseFloat(
                160 + 130 * Math.sin(
                    Math.round(360 / D3CyclicScale.prototype.CYCLIC_SCALE.length * D3CyclicScale.prototype.CYCLIC_SCALE.indexOf(this.chord[i]) - 90) * Math.PI / 180
                )
            )
        });
    }

    return points;
};

Chord.fromProgressionDegree = function(root, degree){
    var sharp = (root.length > 1),
        intDegree = Chord.degreeToInt(degree),
        i = (Chord.prototype.SCALE.indexOf(root.charAt(0)) + (intDegree - 1) * 2 - (intDegree >= 4 ? 1 : 0)),
        note = Chord.prototype.SCALE[i % Chord.prototype.SCALE.length];

    if (sharp) {
        note += "#";
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

module.exports = Chord;
},{"./D3CyclicScale.js":"E:\\Documents\\IntellijProjects\\music-matcher\\models\\D3CyclicScale.js"}],"E:\\Documents\\IntellijProjects\\music-matcher\\models\\D3CyclicScale.js":[function(require,module,exports){
var Utils = require("./Utils.js");

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
        .data(D3CyclicScale.prototype.CYCLIC_SCALE)
        .enter()
        .append("svg:g")
        .attr("transform", function(d, i){
            return "rotate(" + Math.round(360 / D3CyclicScale.prototype.CYCLIC_SCALE.length * i - 90) + ", 160, 160) translate(290, 160)";
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
            return "rotate(" + Math.round(90 - 360 / D3CyclicScale.prototype.CYCLIC_SCALE.length * i) + ")";
        });

    // Pre-draw chord
    this.chord = this.svg.append("svg:path")
        .attr("class", "chord")
        .attr("stroke", "none");

    this.lastChord = null;
}

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
    return this.COLORS[this.CYCLIC_SCALE.indexOf(D3CyclicScale.chordToCycleChord(chord.getTonic()))];
};

D3CyclicScale.chordToCycleChord = function(chord) {
    var cycleChord = chord;
    if (cycleChord.match(/.*m$/)) {
        cycleChord = cycleChord.substring(0, cycleChord.length - 1);
    }

    if (cycleChord.match(/..#$/)) {
        cycleChord = cycleChord.substring(0, cycleChord.length - 1);
    }

    return cycleChord;
};

D3CyclicScale.drawChord = d3.svg.line()
    .x(function(d){ return d.x; })
    .y(function(d){ return d.y; })
    .interpolate("linear");

D3CyclicScale.prototype.CYCLIC_SCALE = ["C", "G", "D", "A", "E", "B", "F#", "C#", "G#", "D#", "A#", "F"];
D3CyclicScale.prototype.COLORS = ["#bcdf3a", "#a00c08", "#1b9080", "#f88010", "#7f087c", "#f4f43c", "#700d46", "#148f34", "#fa0c0c", "#1c0d82", "#edf087", "#d81386"];

module.exports = D3CyclicScale;
},{"./Utils.js":"E:\\Documents\\IntellijProjects\\music-matcher\\models\\Utils.js"}],"E:\\Documents\\IntellijProjects\\music-matcher\\models\\Utils.js":[function(require,module,exports){
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

module.exports = Utils;
},{}]},{},["E:\\Documents\\IntellijProjects\\music-matcher\\app.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL1NwWWQzci9BcHBEYXRhL1JvYW1pbmcvbnBtL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiYXBwLmpzIiwibW9kZWxzL0Nob3JkLmpzIiwibW9kZWxzL0QzQ3ljbGljU2NhbGUuanMiLCJtb2RlbHMvVXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIENob3JkID0gcmVxdWlyZShcIi4vbW9kZWxzL0Nob3JkLmpzXCIpLFxyXG4gICAgVXRpbHMgPSByZXF1aXJlKFwiLi9tb2RlbHMvVXRpbHMuanNcIiksXHJcbiAgICBEM0N5Y2xpY1NjYWxlID0gcmVxdWlyZShcIi4vbW9kZWxzL0QzQ3ljbGljU2NhbGUuanNcIiksXHJcbiAgICBjZXJjbGVzRGlhdG9uaXF1ZXMgPSBbXTtcclxuXHJcbiQoZnVuY3Rpb24oKXtcclxuICAgICQoJy5jZXJjbGUtZGlhdG9uaXF1ZScpLmVhY2goZnVuY3Rpb24oaSl7XHJcbiAgICAgICAgY2VyY2xlc0RpYXRvbmlxdWVzLnB1c2goe1xyXG4gICAgICAgICAgICBkMzogbmV3IEQzQ3ljbGljU2NhbGUoaSksXHJcbiAgICAgICAgICAgIGludGVydmFsOiBudWxsLFxyXG4gICAgICAgICAgICBwcm9ncmVzc2lvbjogcHJvZ3Jlc3Npb25zW2ldLnByb2dyZXNzaW9uLnNwbGl0KFwiLFwiKVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB2YXIgJGNvbnRhaW5lciA9ICQodGhpcyk7XHJcblxyXG4gICAgICAgICQodGhpcykuZmluZCgnLnBsYXlCdG4nKS5vbignY2xpY2snLCBmdW5jdGlvbihlKXtcclxuICAgICAgICAgICAgJGNvbnRhaW5lci5maW5kKCcucGxheUJ0biwgLnN0b3BCdG4nKS50b2dnbGVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGludGVydmFsID0gY2VyY2xlc0RpYXRvbmlxdWVzW2ldLmludGVydmFsLFxyXG4gICAgICAgICAgICAgICAgZDMgPSBjZXJjbGVzRGlhdG9uaXF1ZXNbaV0uZDMsXHJcbiAgICAgICAgICAgICAgICByb290ID0gcHJvZ3Jlc3Npb25zW2ldLnJvb3QsXHJcbiAgICAgICAgICAgICAgICBwcm9ncmVzc2lvbiA9IGNlcmNsZXNEaWF0b25pcXVlc1tpXS5wcm9ncmVzc2lvbjtcclxuXHJcbiAgICAgICAgICAgIGlmIChpbnRlcnZhbCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBTaG93IGZpcnN0IGNob3JkXHJcbiAgICAgICAgICAgICAgICB2YXIgcGxheWVkQ2hvcmQgPSBDaG9yZC5mcm9tUHJvZ3Jlc3Npb25EZWdyZWUocm9vdCwgcHJvZ3Jlc3Npb24uc2hpZnQoKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJGNvbnRhaW5lci5maW5kKCcucGxheWVkTm90ZScpLnRleHQocGxheWVkQ2hvcmQuZ2V0VG9uaWMoKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZDMuY2hvcmRUcmFuc2l0aW9uKHBsYXllZENob3JkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBSdW4gcHJvY2Vzc1xyXG4gICAgICAgICAgICAgICAgY2VyY2xlc0RpYXRvbmlxdWVzW2ldLmludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb2dyZXNzaW9uLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBsYXllZENob3JkID0gQ2hvcmQuZnJvbVByb2dyZXNzaW9uRGVncmVlKHJvb3QsIHByb2dyZXNzaW9uLnNoaWZ0KCkpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgJGNvbnRhaW5lci5maW5kKCcucGxheWVkTm90ZScpLnRleHQocGxheWVkQ2hvcmQuZ2V0VG9uaWMoKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkMy5jaG9yZFRyYW5zaXRpb24ocGxheWVkQ2hvcmQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZXJjbGVzRGlhdG9uaXF1ZXNbaV0ucHJvZ3Jlc3Npb24gPSBwcm9ncmVzc2lvbnNbaV0ucHJvZ3Jlc3Npb24uc3BsaXQoXCIsXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVzZXQgVUlcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGNvbnRhaW5lci5maW5kKCcucGxheWVkTm90ZScpLnRleHQoXCItXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLmZpbmQoJy5wbGF5QnRuLCAuc3RvcEJ0bicpLnRvZ2dsZUNsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGQzLmNob3JkVHJhbnNpdGlvbihudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCAyMDAwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkKHRoaXMpLmZpbmQoXCIuc3RvcEJ0blwiKS5vbignY2xpY2snLCBmdW5jdGlvbihlKXtcclxuICAgICAgICAgICAgdmFyIGludGVydmFsID0gY2VyY2xlc0RpYXRvbmlxdWVzW2ldLmludGVydmFsLFxyXG4gICAgICAgICAgICAgICAgZDMgPSBjZXJjbGVzRGlhdG9uaXF1ZXNbaV0uZDM7XHJcblxyXG4gICAgICAgICAgICBpZiAoaW50ZXJ2YWwgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICAgICBjZXJjbGVzRGlhdG9uaXF1ZXNbaV0ucHJvZ3Jlc3Npb24gPSBwcm9ncmVzc2lvbnNbaV0ucHJvZ3Jlc3Npb24uc3BsaXQoXCIsXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFJlc2V0IFVJXHJcbiAgICAgICAgICAgICAgICAkY29udGFpbmVyLmZpbmQoJy5wbGF5ZWROb3RlJykudGV4dChcIi1cIik7XHJcbiAgICAgICAgICAgICAgICAkY29udGFpbmVyLmZpbmQoJy5wbGF5QnRuLCAuc3RvcEJ0bicpLnRvZ2dsZUNsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgICAgICAgICAgICBkMy5jaG9yZFRyYW5zaXRpb24obnVsbCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9KVxyXG4gICAgfSk7XHJcbn0pOyIsInZhciBEM0N5Y2xpY1NjYWxlID0gcmVxdWlyZShcIi4vRDNDeWNsaWNTY2FsZS5qc1wiKTtcclxuXHJcbmZ1bmN0aW9uIENob3JkKG5vdGUpe1xyXG4gICAgdGhpcy50b25pYyA9IG5vdGU7XHJcblxyXG4gICAgLy8gR2VuZXJhdGUgdGhlIGNob3JkXHJcbiAgICB2YXIgbWlub3IgPSBmYWxzZTtcclxuICAgIGlmIChub3RlLm1hdGNoKC8uKm0kLykpIHtcclxuICAgICAgICBtaW5vciA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgbm90ZSA9IEQzQ3ljbGljU2NhbGUuY2hvcmRUb0N5Y2xlQ2hvcmQobm90ZSk7XHJcblxyXG4gICAgdGhpcy5jaG9yZCA9IFtcclxuICAgICAgICBub3RlLFxyXG4gICAgICAgIENob3JkLnByb3RvdHlwZS5TQ0FMRVsoQ2hvcmQucHJvdG90eXBlLlNDQUxFLmluZGV4T2Yobm90ZSkgKyAobWlub3IgPyAzIDogNCkpICUgQ2hvcmQucHJvdG90eXBlLlNDQUxFLmxlbmd0aF0sXHJcbiAgICAgICAgQ2hvcmQucHJvdG90eXBlLlNDQUxFWyhDaG9yZC5wcm90b3R5cGUuU0NBTEUuaW5kZXhPZihub3RlKSArIDcpICUgQ2hvcmQucHJvdG90eXBlLlNDQUxFLmxlbmd0aF1cclxuICAgIF07XHJcbn1cclxuXHJcbkNob3JkLnByb3RvdHlwZS5TQ0FMRSA9IFtcIkNcIiwgXCJDI1wiLCBcIkRcIiwgXCJEI1wiLCBcIkVcIiwgXCJGXCIsIFwiRiNcIiwgXCJHXCIsIFwiRyNcIiwgXCJBXCIsIFwiQSNcIiwgXCJCXCJdO1xyXG5cclxuQ2hvcmQucHJvdG90eXBlLmdldFRvbmljID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy50b25pYztcclxufTtcclxuXHJcbkNob3JkLnByb3RvdHlwZS5nZXRDaG9yZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuY2hvcmQ7XHJcbn07XHJcblxyXG5DaG9yZC5wcm90b3R5cGUuZ2V0Q2hvcmRBc1BvaW50cyA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgcG9pbnRzID0gW107XHJcbiAgICBmb3IgKHZhciBpPTA7IGk8dGhpcy5jaG9yZC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHBvaW50cy5wdXNoKHtcclxuICAgICAgICAgICAgeDogcGFyc2VGbG9hdChcclxuICAgICAgICAgICAgICAgIDE2MCArIDEzMCAqIE1hdGguY29zKFxyXG4gICAgICAgICAgICAgICAgICAgIE1hdGgucm91bmQoMzYwIC8gRDNDeWNsaWNTY2FsZS5wcm90b3R5cGUuQ1lDTElDX1NDQUxFLmxlbmd0aCAqIEQzQ3ljbGljU2NhbGUucHJvdG90eXBlLkNZQ0xJQ19TQ0FMRS5pbmRleE9mKHRoaXMuY2hvcmRbaV0pIC0gOTApICogTWF0aC5QSSAvIDE4MFxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICApLFxyXG4gICAgICAgICAgICB5OiBwYXJzZUZsb2F0KFxyXG4gICAgICAgICAgICAgICAgMTYwICsgMTMwICogTWF0aC5zaW4oXHJcbiAgICAgICAgICAgICAgICAgICAgTWF0aC5yb3VuZCgzNjAgLyBEM0N5Y2xpY1NjYWxlLnByb3RvdHlwZS5DWUNMSUNfU0NBTEUubGVuZ3RoICogRDNDeWNsaWNTY2FsZS5wcm90b3R5cGUuQ1lDTElDX1NDQUxFLmluZGV4T2YodGhpcy5jaG9yZFtpXSkgLSA5MCkgKiBNYXRoLlBJIC8gMTgwXHJcbiAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcG9pbnRzO1xyXG59O1xyXG5cclxuQ2hvcmQuZnJvbVByb2dyZXNzaW9uRGVncmVlID0gZnVuY3Rpb24ocm9vdCwgZGVncmVlKXtcclxuICAgIHZhciBzaGFycCA9IChyb290Lmxlbmd0aCA+IDEpLFxyXG4gICAgICAgIGludERlZ3JlZSA9IENob3JkLmRlZ3JlZVRvSW50KGRlZ3JlZSksXHJcbiAgICAgICAgaSA9IChDaG9yZC5wcm90b3R5cGUuU0NBTEUuaW5kZXhPZihyb290LmNoYXJBdCgwKSkgKyAoaW50RGVncmVlIC0gMSkgKiAyIC0gKGludERlZ3JlZSA+PSA0ID8gMSA6IDApKSxcclxuICAgICAgICBub3RlID0gQ2hvcmQucHJvdG90eXBlLlNDQUxFW2kgJSBDaG9yZC5wcm90b3R5cGUuU0NBTEUubGVuZ3RoXTtcclxuXHJcbiAgICBpZiAoc2hhcnApIHtcclxuICAgICAgICBub3RlICs9IFwiI1wiO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChkZWdyZWUubWF0Y2goL1tpdl0rLykpIHtcclxuICAgICAgICBub3RlICs9IFwibVwiO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZXcgQ2hvcmQobm90ZSk7XHJcbn07XHJcblxyXG5DaG9yZC5kZWdyZWVUb0ludCA9IGZ1bmN0aW9uKGRlZ3JlZSl7XHJcbiAgICBzd2l0Y2ggKGRlZ3JlZSkge1xyXG4gICAgICAgIGNhc2UgJ0knOlxyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICBjYXNlICdJSSc6XHJcbiAgICAgICAgY2FzZSAnaWknOlxyXG4gICAgICAgICAgICByZXR1cm4gMjtcclxuICAgICAgICBjYXNlICdJSUknOlxyXG4gICAgICAgIGNhc2UgJ2lpaSc6XHJcbiAgICAgICAgICAgIHJldHVybiAzO1xyXG4gICAgICAgIGNhc2UgJ0lWJzpcclxuICAgICAgICAgICAgcmV0dXJuIDQ7XHJcbiAgICAgICAgY2FzZSAnVic6XHJcbiAgICAgICAgICAgIHJldHVybiA1O1xyXG4gICAgICAgIGNhc2UgJ1ZJJzpcclxuICAgICAgICBjYXNlICd2aSc6XHJcbiAgICAgICAgICAgIHJldHVybiA2O1xyXG4gICAgICAgIGNhc2UgJ1ZJSSc6XHJcbiAgICAgICAgICAgIHJldHVybiA3O1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDaG9yZDsiLCJ2YXIgVXRpbHMgPSByZXF1aXJlKFwiLi9VdGlscy5qc1wiKTtcclxuXHJcbmZ1bmN0aW9uIEQzQ3ljbGljU2NhbGUocG9zaXRpb24pIHtcclxuICAgIC8vIERpYXRvbmljIHdoZWVsXHJcbiAgICB0aGlzLnN2ZyA9IGQzLnNlbGVjdCgnLmNlcmNsZS1kaWF0b25pcXVlW2RhdGEtaW5kZXg9XCInK3Bvc2l0aW9uKydcIl0nKVxyXG4gICAgICAgIC5hcHBlbmQoXCJzdmc6c3ZnXCIpXHJcbiAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCAzMjApXHJcbiAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgMzIwKTtcclxuXHJcbiAgICAvLyBEcmF3IGNpcmNsZVxyXG4gICAgdGhpcy5zdmcuYXBwZW5kKFwic3ZnOmNpcmNsZVwiKVxyXG4gICAgICAgIC5hdHRyKFwiY3lcIiwgMTYwKVxyXG4gICAgICAgIC5hdHRyKFwiY3hcIiwgMTYwKVxyXG4gICAgICAgIC5hdHRyKFwiclwiLCAxMzApXHJcbiAgICAgICAgLmF0dHIoXCJmaWxsXCIsIFwibm9uZVwiKVxyXG4gICAgICAgIC5hdHRyKFwic3Ryb2tlXCIsIFwiYmxhY2tcIik7XHJcblxyXG4gICAgLy8gRHJhdyBheGlzXHJcbiAgICB2YXIgYXhpcyA9IHRoaXMuc3ZnLmFwcGVuZChcInN2ZzpnXCIpXHJcbiAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImF4aXNcIilcclxuICAgICAgICAuc2VsZWN0QWxsKFwidGV4dC5sYWJlbFwiKVxyXG4gICAgICAgIC5kYXRhKEQzQ3ljbGljU2NhbGUucHJvdG90eXBlLkNZQ0xJQ19TQ0FMRSlcclxuICAgICAgICAuZW50ZXIoKVxyXG4gICAgICAgIC5hcHBlbmQoXCJzdmc6Z1wiKVxyXG4gICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQsIGkpe1xyXG4gICAgICAgICAgICByZXR1cm4gXCJyb3RhdGUoXCIgKyBNYXRoLnJvdW5kKDM2MCAvIEQzQ3ljbGljU2NhbGUucHJvdG90eXBlLkNZQ0xJQ19TQ0FMRS5sZW5ndGggKiBpIC0gOTApICsgXCIsIDE2MCwgMTYwKSB0cmFuc2xhdGUoMjkwLCAxNjApXCI7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgYXhpcy5hcHBlbmQoXCJzdmc6bGluZVwiKVxyXG4gICAgICAgIC5hdHRyKFwieDFcIiwgMSlcclxuICAgICAgICAuYXR0cihcInkxXCIsIDApXHJcbiAgICAgICAgLmF0dHIoXCJ4MlwiLCA1KVxyXG4gICAgICAgIC5hdHRyKFwieTJcIiwgMClcclxuICAgICAgICAuYXR0cihcInN0cm9rZVwiLCBcImJsYWNrXCIpO1xyXG5cclxuICAgIGF4aXMuYXBwZW5kKFwic3ZnOnRleHRcIilcclxuICAgICAgICAudGV4dChmdW5jdGlvbihub3RlKXtcclxuICAgICAgICAgICAgcmV0dXJuIG5vdGU7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuYXR0cihcImZvbnQtd2VpZ2h0XCIsIFwiNzAwXCIpXHJcbiAgICAgICAgLmF0dHIoXCJ4XCIsIGZ1bmN0aW9uKGQsIGkpe1xyXG4gICAgICAgICAgICBpZiAoaSA+IDAgJiYgaSA8IDYpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiA4O1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGkgPiA2KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gLSh0aGlzLmdldEJCb3goKS53aWR0aCArIDgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gLSh0aGlzLmdldEJCb3goKS53aWR0aCAvIDIpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmF0dHIoXCJ5XCIsIGZ1bmN0aW9uKGQsIGkpe1xyXG4gICAgICAgICAgICBpZiAoaSA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gLTg7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaSA+IDMgJiYgaSA8IDkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEJCb3goKS5oZWlnaHQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmF0dHIoXCJmaWxsXCIsIGZ1bmN0aW9uKGQsIGkpe1xyXG4gICAgICAgICAgICByZXR1cm4gRDNDeWNsaWNTY2FsZS5wcm90b3R5cGUuQ09MT1JTW2ldO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24oZCwgaSl7XHJcbiAgICAgICAgICAgIHJldHVybiBcInJvdGF0ZShcIiArIE1hdGgucm91bmQoOTAgLSAzNjAgLyBEM0N5Y2xpY1NjYWxlLnByb3RvdHlwZS5DWUNMSUNfU0NBTEUubGVuZ3RoICogaSkgKyBcIilcIjtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAvLyBQcmUtZHJhdyBjaG9yZFxyXG4gICAgdGhpcy5jaG9yZCA9IHRoaXMuc3ZnLmFwcGVuZChcInN2ZzpwYXRoXCIpXHJcbiAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImNob3JkXCIpXHJcbiAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgXCJub25lXCIpO1xyXG5cclxuICAgIHRoaXMubGFzdENob3JkID0gbnVsbDtcclxufVxyXG5cclxuRDNDeWNsaWNTY2FsZS5wcm90b3R5cGUuY2hvcmRUcmFuc2l0aW9uID0gZnVuY3Rpb24obmV3Q2hvcmQpIHtcclxuICAgIC8vIFJlc2V0IHRoZSB2aWV3XHJcbiAgICBpZiAobmV3Q2hvcmQgPT0gbnVsbCkge1xyXG4gICAgICAgIHRoaXMubGFzdENob3JkID0gbnVsbDtcclxuXHJcbiAgICAgICAgdGhpcy5jaG9yZC50cmFuc2l0aW9uKClcclxuICAgICAgICAgICAgLmF0dHIoXCJkXCIsIG51bGwpXHJcbiAgICAgICAgICAgIC5hdHRyKFwiZmlsbFwiLCBudWxsKVxyXG4gICAgICAgICAgICAuZHVyYXRpb24oNTAwKVxyXG4gICAgICAgICAgICAuZWFzZShcImxpbmVhclwiKTtcclxuXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmxhc3RDaG9yZCA9PSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5sYXN0Q2hvcmQgPSBuZXdDaG9yZC5nZXRDaG9yZEFzUG9pbnRzKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMubGFzdENob3JkID0gVXRpbHMudHJhbnNmb3JtKHRoaXMubGFzdENob3JkLCBuZXdDaG9yZC5nZXRDaG9yZEFzUG9pbnRzKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuY2hvcmQudHJhbnNpdGlvbigpXHJcbiAgICAgICAgLmF0dHIoXCJkXCIsIEQzQ3ljbGljU2NhbGUuZHJhd0Nob3JkKHRoaXMubGFzdENob3JkKSArIFwiWlwiKVxyXG4gICAgICAgIC5hdHRyKFwiZmlsbFwiLCB0aGlzLmNob3JkVG9Db2xvcihuZXdDaG9yZCkpXHJcbiAgICAgICAgLmR1cmF0aW9uKDUwMClcclxuICAgICAgICAuZWFzZShcImxpbmVhclwiKTtcclxufTtcclxuXHJcbkQzQ3ljbGljU2NhbGUucHJvdG90eXBlLmNob3JkVG9Db2xvciA9IGZ1bmN0aW9uKGNob3JkKSB7XHJcbiAgICByZXR1cm4gdGhpcy5DT0xPUlNbdGhpcy5DWUNMSUNfU0NBTEUuaW5kZXhPZihEM0N5Y2xpY1NjYWxlLmNob3JkVG9DeWNsZUNob3JkKGNob3JkLmdldFRvbmljKCkpKV07XHJcbn07XHJcblxyXG5EM0N5Y2xpY1NjYWxlLmNob3JkVG9DeWNsZUNob3JkID0gZnVuY3Rpb24oY2hvcmQpIHtcclxuICAgIHZhciBjeWNsZUNob3JkID0gY2hvcmQ7XHJcbiAgICBpZiAoY3ljbGVDaG9yZC5tYXRjaCgvLiptJC8pKSB7XHJcbiAgICAgICAgY3ljbGVDaG9yZCA9IGN5Y2xlQ2hvcmQuc3Vic3RyaW5nKDAsIGN5Y2xlQ2hvcmQubGVuZ3RoIC0gMSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGN5Y2xlQ2hvcmQubWF0Y2goLy4uIyQvKSkge1xyXG4gICAgICAgIGN5Y2xlQ2hvcmQgPSBjeWNsZUNob3JkLnN1YnN0cmluZygwLCBjeWNsZUNob3JkLmxlbmd0aCAtIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjeWNsZUNob3JkO1xyXG59O1xyXG5cclxuRDNDeWNsaWNTY2FsZS5kcmF3Q2hvcmQgPSBkMy5zdmcubGluZSgpXHJcbiAgICAueChmdW5jdGlvbihkKXsgcmV0dXJuIGQueDsgfSlcclxuICAgIC55KGZ1bmN0aW9uKGQpeyByZXR1cm4gZC55OyB9KVxyXG4gICAgLmludGVycG9sYXRlKFwibGluZWFyXCIpO1xyXG5cclxuRDNDeWNsaWNTY2FsZS5wcm90b3R5cGUuQ1lDTElDX1NDQUxFID0gW1wiQ1wiLCBcIkdcIiwgXCJEXCIsIFwiQVwiLCBcIkVcIiwgXCJCXCIsIFwiRiNcIiwgXCJDI1wiLCBcIkcjXCIsIFwiRCNcIiwgXCJBI1wiLCBcIkZcIl07XHJcbkQzQ3ljbGljU2NhbGUucHJvdG90eXBlLkNPTE9SUyA9IFtcIiNiY2RmM2FcIiwgXCIjYTAwYzA4XCIsIFwiIzFiOTA4MFwiLCBcIiNmODgwMTBcIiwgXCIjN2YwODdjXCIsIFwiI2Y0ZjQzY1wiLCBcIiM3MDBkNDZcIiwgXCIjMTQ4ZjM0XCIsIFwiI2ZhMGMwY1wiLCBcIiMxYzBkODJcIiwgXCIjZWRmMDg3XCIsIFwiI2Q4MTM4NlwiXTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRDNDeWNsaWNTY2FsZTsiLCJmdW5jdGlvbiBVdGlscygpe31cclxuXHJcblV0aWxzLnRyYW5zZm9ybSAgPSBmdW5jdGlvbihhLCBiKSB7XHJcbiAgICBpZiAoYi5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYS5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgIHJldHVybiBiO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEtlZXAgb25seSBjaGFuZ2VkIHZhbHVlcyBpbiBiIGFuZCB1bmNoYW5nZWQgdmFsdWVzIGluIGFcclxuICAgIGZvciAodmFyIGk9MDsgaTxhLmxlbmd0aDtpKyspe1xyXG4gICAgICAgIHZhciBwb3MgPSBVdGlscy5pbmRleE9mUG9pbnQoYiwgYVtpXSk7XHJcbiAgICAgICAgaWYgKHBvcyA9PSAtMSkge1xyXG4gICAgICAgICAgICBhW2ldID0gLTE7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYi5zcGxpY2UocG9zLCAxKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWRkIGNoYW5nZWQgdmFsdWVzIHRvIGFcclxuICAgIGZvciAodmFyIGo9MDsgajxhLmxlbmd0aDtqKyspIHtcclxuICAgICAgICBpZiAoYVtqXSA9PSAtMSkge1xyXG4gICAgICAgICAgICBhW2pdID0gYlswXTtcclxuICAgICAgICAgICAgYi5zcGxpY2UoMCwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBhO1xyXG59O1xyXG5cclxuVXRpbHMuaW5kZXhPZlBvaW50ID0gZnVuY3Rpb24gKGFycmF5LCBwb2ludCkge1xyXG4gICAgZm9yICh2YXIgaT0wOyBpPGFycmF5Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKGFycmF5W2ldLnggPT0gcG9pbnQueCAmJiBhcnJheVtpXS55ID09IHBvaW50LnkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiAtMTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVXRpbHM7Il19
