/**
 * Created by Thomas TRIBOULT on 16/02/2015.
 */
var mongoose = require("mongoose"),
    async = require("async"),
    schema = new mongoose.Schema({
        title: String,
        artist: {
            type: mongoose.Schema.ObjectId,
            ref: 'Artist'
        },
        parts: [{
            element: String,
            root: String,
            progression: [String]
        }]
    });

schema.statics.getSong = function(id, callback) {
    var song = {};
    Song.findOne({_id: id})
        .populate('artist')
        .exec(function(err, doc){
            if (!err) {
                song = doc;
            }

            callback(song);
        });
};

schema.statics.random = function(nb, callback) {
    var indexes = [],
        find = function(){
            var songs = [],
                calls = [];

            indexes.forEach(function(i){
                calls.push(function(callback){
                    Song.findOne()
                        .skip(indexes[i])
                        .populate('artist')
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

module.exports = Song = mongoose.model('Song', schema);