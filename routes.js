var path = require('path'),
    mongoose = require('mongoose'),
    fs = require('fs'),
    Song = require('./models/Song');

module.exports = {
    // Homepage
    index: function(req, res) {
        Song.random(4, function(songs){
            res.render('homepage', {
                songs: songs,
                homepage: true
            });
        });
    },
    // View song page
    song: function(req, res) {
        Song.getSong(req.params.id, function(song){
            song.findSimilar(function(songs){
                res.render('song', {
                    song: song,
                    similar: songs,
                    tones: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
                });
            });
        });
    },
    // AJAX search method
    search: function(req, res) {
        Song.search(req.query.q, 10, function(songs){
            var result = {
                results: []
            };

            for (var i in songs) {
                result.results.push({
                    title: songs[i].title,
                    description: 'Par ' + songs[i].artist,
                    url: '/song/' + songs[i].id
                });
            }
            res.send(result);
        });
    },
    // Clean and recreate database with stubs data
    loadData: function(req, res) {
        // Drop database collections
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
                s.song.save();
            });
        });

        res.send("Stubs imported.");
    },
    // 404 page
    e404: function(req, res){
        res.status(404)
            .send("Page introuvable");
    }
};