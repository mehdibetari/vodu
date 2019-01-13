let express = require('express');
let app     = express();
let RoutesControllers = require('./routes.controllers');
let routesControllers = new RoutesControllers();

// Add headers
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://ergots.fr');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    // Pass to next layer of middleware
    next();
});
    
app.get('/', function(req, res) {
    routesControllers.home(req, res);
});
app.get('/calendrier/netflix/:media_id*?', function(req, res){
    routesControllers.calendarList('netflix', req, res);
});
app.get('/json/calendrier/netflix', function(req, res){
    routesControllers.calendarList('json-netflix', req, res);
});
app.get('/amp/calendrier/netflix', function(req, res){
    routesControllers.calendarList('amp-netflix', req, res);
});
app.get('/episode-chaque-semaine/netflix/:media_id*?', function(req, res){
    routesControllers.weeklyList('netflix', req, res);
});
app.get('/packager/:input*?', function(req, res){
    routesControllers.xspeedit(req, res);
});
app.get('/vodu/refresh/:key*?', function(req, res){
    routesControllers.refreshUpcomings(req, res);
});

app.use(express.static('./public'));
exports = module.exports = app;