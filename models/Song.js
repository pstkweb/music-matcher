var mongoose = require("mongoose"),
    Utils = require("./Utils"),
    BMH = require("./BoyerMooreHorspool"),
    random = require('mongoose-simple-random'),
    schema = new mongoose.Schema({
        title: String,
        artist: String,
        parts: [{
            element: String,
            root: String,
            progression: [String]
        }]
    });

// Add random support
schema.plugin(random);

// Set the full text search index on song title and artist name
schema.index({title: 'text', artist: 'text'});

schema.methods.findSimilar = function(callback){
    var currentSong = this;
    Song.find({ _id: { $ne: this._id}})
        .exec(function(err, songs){
            if (!err) {
                var simSongs = songs.filter(function(song){
                    for (var i=0; i<this.parts.length; i++) {
                        var chunks = Utils.subLists(this.parts[i].progression, 4);
                        for (var j in chunks) {
                            for (var k=0; k<song.parts.length; k++) {
                                if (BMH.run(chunks[j], song.parts[k].progression) != -1) {
                                    song.similarity = {
                                        part: k,
                                        prog: chunks[j]
                                    };
                                    return true;
                                }
                            }
                        }
                    }

                    return false;
                }, currentSong);

                // Reduce to first five
                if (simSongs.length > 5)
                    simSongs.length = 5;

                callback(simSongs);
            }
        });
};

module.exports = Song = mongoose.model('Song', schema);