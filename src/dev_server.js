var express = require('express');
var app     = express();
var dust    = require('dustjs-linkedin');
var fs      = require('fs');
app.get('/', function(req, res) {
    res.redirect('/calendrier/netflix');
});
app.get('/calendrier/netflix', function(req, res){
    fs.readFile('./front-layout/agenda-netflix.html', 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        fs.readFile('./store/netflix-upcoming.json', 'utf8', function (error,response) {
            if (error) {
                return console.log(error);
            }
            var tmpl = dust.compile(data, 'view-netflix');
            dust.loadSource(tmpl);
            const lastUpdateDate = new Date(JSON.parse(response).timeStamp);
            const fullDate = lastUpdateDate.getDate()+'.'+(lastUpdateDate.getMonth()+1)+'.'+lastUpdateDate.getFullYear()+' à '+lastUpdateDate.getHours()+'h'+lastUpdateDate.getMinutes();
            var view = dust.render('view-netflix', { list: JSON.parse(response).items, lastUpdate: fullDate }, function(e, out) {
                if(e) {
                    console.error(e);
                } else {
                    // Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
                    res.send(out);
                }
            });
        });
    });
});

app.get('/episode-chaque-semaine/netflix', function(req, res){
    fs.readFile('./store/every-week-netflix.html', 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        fs.readFile('./public/netflix-every-week.json', 'utf8', function (error,response) {
            if (error) {
                return console.log(error);
            }
            var tmpl = dust.compile(data, 'view-netflix');
            dust.loadSource(tmpl);
            const netflixEveryWeekData = JSON.parse(response);
            const lastUpdateDate = new Date(netflixEveryWeekData.timeStamp);
            const fullDate = lastUpdateDate.getDate()+'.'+(lastUpdateDate.getMonth()+1)+'.'+lastUpdateDate.getFullYear();
            const fullTime = lastUpdateDate.getHours()+'h'+(lastUpdateDate.getMinutes()<10?'0':'') + lastUpdateDate.getMinutes();
            const fullDateTime = fullDate+' à '+fullTime;
            var view = dust.render('view-netflix', { list: netflixEveryWeekData.items, lastUpdate: fullDateTime, theFooter: netflixEveryWeekData.footer}, function(e, out) {
                if(e) {
                    console.error(e);
                } else {
                    // Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
                    res.send(out);
                }
            });
        });
    });
});

app.use(express.static('public'));
app.listen('8007');
exports = module.exports = app;