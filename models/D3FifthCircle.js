var Utils = require("./Utils"),
    Chord = require("./Chord");

/**
 * Create a D3 visualisation of the circle of fifth
 * @param position The position of this circle in the page
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
            if (i === 0) {
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
    if (newChord === null) {
        this.lastChord = null;

        this.chord.transition()
            .attr("d", null)
            .attr("fill", null)
            .duration(500)
            .ease("linear");

        return;
    }

    if (this.lastChord === null) {
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