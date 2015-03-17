var mongoose = require("mongoose"),
    async = require("async"),
    Utils = require("./Utils"),
    BMH = require("./BoyerMooreHorspool"),
    schema = new mongoose.Schema({
        title: String,
        artist: String,
        parts: [{
            element: String,
            root: String,
            progression: [String]
        }]
    });

// Set the full text search index on song title and artist name
schema.index({title: 'text', artist: 'text'});

schema.statics.random = function(nb, callback) {
    var indexes = [],
        find = function(){
            var songs = [],
                calls = [];

            indexes.forEach(function(i){
                calls.push(function(callback){
                    Song.findOne()
                        .skip(indexes[i])
                        .exec(function(err, song){
                            if (err)
                                return callback(err);

                            songs.push(song);
                            callback(null, song);
                        });
                });
            });

            async.parallel(calls, function(err, song){
                if (!err) {
                    callback(songs);
                }
            });
        };

    this.count(function(err, count) {
        if (err) {
            return;
        }

        while (indexes.length < nb) {
            var rand = Math.floor(Math.random() * count);

            if (indexes.indexOf(rand) == -1) {
                indexes.push(rand);
            }
        }

        find();
    });
};

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