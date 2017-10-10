var express = require('express');
var app     = express();
var dust    = require('dustjs-linkedin');
var fs      = require('fs');
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
            const metaData = getMediaMetaData(req.params.media_id,netflixUpcoming.items, lastUpdateDate, 'http://alloserie.fr/calendrier/netflix/');
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
            const metaData = getMediaMetaData(req.params.media_id,netflixEveryWeekData.items, lastUpdateDate, 'http://alloserie.fr/episode-chaque-semaine/netflix/');
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
            title: 'Agenda des sorties Netflix 2017 2018',
            description: 'Calendrier mis à jour le ' + lastUpdateDate,
            image: 'https://ucarecdn.com/6c7ac889-fb0d-4535-a85b-e65e5983eefb/netflixoriginal.jpg'
        };
    }
}

app.use(express.static('public'));
app.listen('8007');
exports = module.exports = app;
