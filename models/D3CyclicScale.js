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