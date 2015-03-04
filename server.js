/**
 * Created by Thomas TRIBOULT on 16/02/2015.
 */
var config = require('./config'),
    routes = require('./routes'),
    express = require('express'),
    exphbs = require('express-handlebars'),
    mongoose = require('mongoose'),
    app = express();

app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
app.disable('etag');

// MongoDB connection
mongoose.connect('mongodb://' + config.mongo.server + '/' + config.mongo.db);

app.get('/', routes.index)
    .get('/song/:id', routes.song)
    .get('/load-data', routes.loadData);

// Static part of the server to serve files (CSS/IMG/JS/...)
app.use('/', express.static(__dirname + "/public/"));

var server = app.listen(config.port, function(){
    console.log("Server listening on port %s ", config.port);
});