/**
 * Created by Thomas TRIBOULT on 16/02/2015.
 */
var mongoose = require("mongoose"),
    schema = new mongoose.Schema({
        name: String
    });

module.exports = Artist = mongoose.model('Artist', schema);