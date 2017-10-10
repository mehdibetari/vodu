var express = require('express');
var app     = express();
var dust    = require('dustjs-linkedin');
var fs      = require('fs');

const ALLOSERIE_NETFLIX_WEEKLY_URL = 'http://alloserie.fr/episode-chaque-semaine/netflix/';
const ALLOSERIE_NETFLIX_WEEKLY_TITLE = 'Nouveaux épisodes chaque semaines sur Netflix';
const ALLOSERIE_NETFLIX_CALENDAR_URL = 'http://alloserie.fr/calendrier/netflix/';
const ALLOSERIE_NETFLIX_CALENDAR_TITLE = 'Agenda Calendrier Netflix 2017 2018 2019';

app.get('/', function(req, res) {
    res.redirect('/calendrier/netflix');
});
app.get('/calendrier/netflix/:media_id*?', function(req, res){
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
            const netflixUpcoming = JSON.parse(response);
            const lastUpdateDate = new Date(netflixUpcoming.timeStamp);
            const fullDate = lastUpdateDate.getDate()+'.'+(lastUpdateDate.getMonth()+1)+'.'+lastUpdateDate.getFullYear()+' à '+lastUpdateDate.getHours()+'h'+lastUpdateDate.getMinutes();
            const metaData = getMediaMetaData(req.params.media_id,netflixUpcoming.items, lastUpdateDate, ALLOSERIE_NETFLIX_CALENDAR_URL);
            var view = dust.render('view-netflix', { 
                list: netflixUpcoming.items, 
                lastUpdate: fullDate,
                meta: metaData
            }, 
            function(e, out) {
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

app.get('/episode-chaque-semaine/netflix/:media_id*?', function(req, res){
    fs.readFile('./front-layout/every-week-netflix.html', 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        fs.readFile('./store/netflix-every-week.json', 'utf8', function (error,response) {
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
            const metaData = getMediaMetaData(req.params.media_id,netflixEveryWeekData.items, lastUpdateDate, ALLOSERIE_NETFLIX_CALENDAR_URL);
            var view = dust.render('view-netflix', { 
                list: netflixEveryWeekData.items, 
                lastUpdate: fullDateTime, 
                theFooter: netflixEveryWeekData.footer,
                meta: metaData
            }, function(e, out) {
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

function getMediaMetaData (mediaId, items, lastUpdateDate, baseUrl) {
    const media = items.filter(function (item) {
        return item.id == mediaId;
    });
    if (media[0] && media[0].premiereDate) {
        return {
            url: baseUrl + mediaId,
            title: media[0].name + ' - date de sortie: ' + media[0].premiereDate + ' sur Netflix',
            description: (media[0].summary) ? media[0].summary : 'Calendrier mis à jour le ' + lastUpdateDate,
            image: media[0].localPath
        };
    }
    else if (media[0] && media[0].recurence) {
        return {
            url: baseUrl + mediaId,
            title: media[0].name + ' ' + media[0].recurence + ' sur Netflix',
            description: (media[0].summary) ? media[0].summary : 'Calendrier mis à jour le ' + lastUpdateDate,
            image: media[0].localPath
        };
    }
    else {
        return {
            url: baseUrl,
            title: (baseUrl === ALLOSERIE_NETFLIX_WEEKLY_URL) ? ALLOSERIE_NETFLIX_WEEKLY_TITLE:ALLOSERIE_NETFLIX_CALENDAR_TITLE,
            description: 'Calendrier mis à jour le ' + lastUpdateDate,
            image: 'https://ucarecdn.com/342ba0b7-5883-408c-8b19-de42c55a6fa7/alloserielogo2x.jpg'
        };
    }
}

app.use(express.static('./public'));
app.listen('80');
exports = module.exports = app;
