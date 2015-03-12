/**
 * Created by Thomas TRIBOULT on 16/02/2015.
 */
var Song = require('../models/Song');

module.exports = {
    song: new Song({
        title: 'Under The Bridge',
        artist: 'Red Hot Chili Peppers',
        parts: [
            {
                element: 'Intro',
                root: 'D',
                progression: ['I', 'V/vi', 'I', 'V/vi']
            },
            {
                element: 'Verse',
                root: 'E',
                progression: ['I', 'V', 'vi', 'iii', 'IV', 'I', 'V', 'vi', 'IV', 'I', 'V', 'vi', 'iii', 'IV', 'I', 'V', 'vi', 'IV', 'I7']
            },
            {
                element: 'Chorus',
                root: 'E',
                progression: ['ii', 'I', 'V', 'ii', 'ii', 'I', 'V', 'ii', 'ii', 'I', 'V', 'ii', 'ii', 'I', 'V', 'ii', 'I', 'V', 'vi', 'iii', 'IV', 'I', 'V', 'vi', 'IV']
            }
        ]
    })
};