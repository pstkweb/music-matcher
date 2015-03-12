/**
 * Created by Thomas TRIBOULT on 16/02/2015.
 */
var Song = require('../models/Song');

module.exports = {
    song: new Song({
        title: 'What\'s My Age Again',
        artist: 'Blink 182',
        parts: [
            {
                element: 'Verse',
                root: 'C',
                progression: ['IV', 'I', 'V', 'vi', 'IV', 'I', 'V', 'vi', 'IV', 'I', 'V', 'vi', 'IV', 'I', 'V', 'V', 'IV']
            },
            {
                element: 'Chorus',
                root: 'F#',
                progression: ['I', 'V', 'vi', 'IV', 'I', 'V', 'vi', 'IV', 'I', 'V', 'vi', 'IV', 'I', 'V', 'vi', 'V', 'IV']
            }
        ]
    })
};