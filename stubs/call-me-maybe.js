/**
 * Created by Thomas TRIBOULT on 16/02/2015.
 */
var Song = require('../models/Song');

module.exports = {
    song: new Song({
        title: 'Call Me Maybe',
        artist: 'Carly Rae Jepsen',
        parts: [
            {
                element: 'Chorus',
                root: 'F#',
                progression: ['IV', 'I', 'V', 'vi', 'IV', 'I', 'V']
            }
        ]
    })
};