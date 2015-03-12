/**
 * Created by Thomas TRIBOULT on 16/02/2015.
 */
var Song = require('../models/Song');

module.exports = {
    song: new Song({
        title: 'Save Tonight',
        artist: 'Eagle Eye Cherry',
        parts: [
            {
                element: 'Intro',
                root: 'C',
                progression: ['vi', 'IV', 'I', 'V', 'vi', 'IV', 'I', 'V']
            },
            {
                element: 'Chorus',
                root: 'C',
                progression: ['vi', 'IV', 'I', 'V', 'vi', 'IV', 'I', 'V', 'vi', 'IV', 'I', 'V', 'vi', 'IV', 'I', 'V']
            }
        ]
    })
};