var express = require('express');
var app     = express();
var dust    = require('dustjs-linkedin');
var fs      = require('fs');

app.get('/calendrier/netflix', function(req, res){
    fs.readFile('./front-layout/test.html', 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        console.log(data);
        var tmpl = dust.compile(data, 'view-netflix');
        dust.loadSource(tmpl);
        var view = dust.render('view-netflix', { version: 'toto' }, function(err, out) {
            if(err) {
                console.error(err);
            } else {
                // Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
                res.send(out);
            }
        });

    });
});

app.listen('80');
console.log('Magic happens on port 8081');
exports = module.exports = app;