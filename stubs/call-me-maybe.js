/**
 * Created by Thomas TRIBOULT on 16/02/2015.
 */
var Song = require('../models/Song'),
    Artist = require('../models/Artist'),
    artist = new Artist({ name: 'Carly Rae Jepsen' });

module.exports = {
    song: new Song({
        title: 'Call Me Maybe',
        artist: artist,
        parts: [
            {
                element: 'Chorus',
                root: 'F#',
                progression: ['IV', 'I', 'V', 'vi', 'IV', 'I', 'V']
            }
        ]
    }),
    artist: artist
};