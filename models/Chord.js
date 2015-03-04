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