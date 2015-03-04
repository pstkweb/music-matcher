var config = require('./config'),
    mongoose = require('mongoose'),
    fs = require('fs'),
    path = require('path'),
    Artist = require('./models/Artist'),
    Song = require('./models/Song');

module.exports = {
    index: function(req, res) {
        Song.random(4, function(songs){
            res.render('homepage', {songs: songs});
        });
    },
    song: function(req, res) {
        Song.getSong(req.params.id, function(song){
            res.render('song', {song: song});
        });
    },
    loadData: function(req, res) {
        // Drop database collections
        mongoose.connection.db.dropCollection('artists', function(err, result) {});
        mongoose.connection.db.dropCollection('songs', function(err, result) {});

        // Load stubs
        fs.readdir('stubs', function(err, files){
            files.map(function(file){
                return path.join('stubs', file);
            }).filter(function(file){
                return fs.statSync(file).isFile();
            }).forEach(function(file){
                var s = require('./' + file);

                console.log('Saving %s', file);
                s.artist.save(function(err){
                    if (!err) {
                        s.song.save();
                    }
                });
            });
        });

        res.send("Stubs imported.");
    }
};