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