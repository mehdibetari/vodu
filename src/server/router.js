let express = require('express');
let app     = express();
let RoutesControllers = require('./routes.controllers');
let routesControllers = new RoutesControllers();

app.get('/', function(req, res) {
    // res.redirect('/calendrier/netflix');
    routesControllers.home(req, res);
});
app.get('/calendrier/netflix/:media_id*?', function(req, res){
    routesControllers.calendarList('netflix', req, res);
});
app.get('/json/calendrier/netflix', function(req, res){
    routesControllers.calendarList('json-netflix', req, res);
});

app.get('/episode-chaque-semaine/netflix/:media_id*?', function(req, res){
    routesControllers.weeklyList('netflix', req, res);
});

app.get('/packager/:input*?', function(req, res){
    routesControllers.xspeedit(req, res);
});

app.use(express.static('./public'));
exports = module.exports = app;