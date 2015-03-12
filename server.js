/**
 * Created by Thomas TRIBOULT on 16/02/2015.
 */
var config = require('./config'),
    routes = require('./routes'),
    express = require('express'),
    exphbs = require('express-handlebars'),
    path = require('path'),
    favicon = require('serve-favicon'),
    mongoose = require('mongoose'),
    app = express();

// Handlebars as template engine
app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    helpers: require('./views/helpers').helpers
}));
app.set('view engine', 'handlebars');
app.disable('etag');

// MongoDB connection
mongoose.connect('mongodb://' + config.mongo.server + '/' + config.mongo.db);

// Handle all server routes
app.get('/', routes.index)
    .get('/search', routes.search)
    .get('/song/:id', routes.song)
    .get('/load-data', routes.loadData);

// Static part of the server to serve files (CSS/IMG/JS/...)
app.use(favicon(path.join(__dirname, 'public', 'img', 'favicon.ico')))
    .use('/', express.static(__dirname + "/public/"));

app.get('*', routes.e404);

// Launch the server
var server = app.listen(config.port, function(){
    console.log("Server listening on port %s", config.port);
});