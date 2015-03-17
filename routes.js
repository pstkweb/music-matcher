var path = require('path'),
    mongoose = require('mongoose'),
    fs = require('fs'),
    Song = require('./models/Song'),
    Chord = require('./models/Chord');

module.exports = {
    // Homepage
    index: function(req, res) {
        Song.findRandom({}, {}, {limit: config.random_songs}, function(err, songs){
            if (!err) {
                res.render('homepage', {
                    songs: songs,
                    homepage: true
                });
            } else {
                res.redirect('/error');
            }
        });
    },
    // View song page
    song: function(req, res) {
        Song.findOne({_id: req.params.id})
            .exec(function(err, song){
                if (!err) {
                    song.findSimilar(function(songs){
                        res.render('song', {
                            song: song,
                            similar: songs,
                            tones: Chord.prototype.SCALE
                        });
                    });
                } else {
                    res.redirect("/error");
                }
            });
    },
    // AJAX search method
    search: function(req, res) {
        Song.find({ $text: { $search: req.query.q}})
            .limit(config.search_results)
            .exec(function(err, songs){
                if (!err) {
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
                } else {
                    res.status(500).send("error");
                }
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