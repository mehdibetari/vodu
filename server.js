var express = require('express');
var app     = express();
var dust    = require('dustjs-linkedin');
var fs      = require('fs');
app.get('/', function(req, res) {
    res.redirect('/calendrier/netflix');
});
app.get('/calendrier/netflix', function(req, res){
    fs.readFile('./front-layout/test.html', 'utf8', function (err,data) {
        if (err) {
            return;
        }
        fs.readFile('./output/netflix-upcoming.json', 'utf8', function (error,response) {
            if (error) {
                return;
            }
            var tmpl = dust.compile(data, 'view-netflix');
            dust.loadSource(tmpl);
            var view = dust.render('view-netflix', { emoj: response }, function(err, out) {
                if(err) {
                    console.error(err);
                } else {
                    // Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
                    res.send(out);
                }
            });
        });
    });
});

app.listen('80');
exports = module.exports = app;