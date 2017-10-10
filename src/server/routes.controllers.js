'use strict';
let dust    = require('dustjs-linkedin');
let fs      = require('fs');
let metaService = require('./meta.service');
let configServer = require('./config-server').configServer;

class RoutesControllers {
    constructor() {
    }

    calendarList (wish, req, res) {
        switch(wish) {
        case 'netflix':
            fs.readFile(configServer.ALLOSERIE_NETFLIX_CALENDAR_LAYOUT, 'utf8', function (err,data) {
                if (err) {
                    return console.log(err);
                }
                fs.readFile(configServer.ALLOSERIE_NETFLIX_UPCOMING_STORE, 'utf8', function (error,response) {
                    if (error) {
                        return console.log(error);
                    }
                    const netflixUpcoming = JSON.parse(response);
                    const lastUpdateDate = new Date(netflixUpcoming.timeStamp);
                    const fullDate = lastUpdateDate.getDate()+'.'+(lastUpdateDate.getMonth()+1)+'.'+lastUpdateDate.getFullYear()+' à '+lastUpdateDate.getHours()+'h'+lastUpdateDate.getMinutes();
                    const metaData = metaService.getMediaMetaData(req.params.media_id,netflixUpcoming.items, lastUpdateDate, configServer.ALLOSERIE_NETFLIX_CALENDAR_URL);
                    
                    var tmpl = dust.compile(data, 'view-netflix');
                    dust.loadSource(tmpl);
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
            break;
        }
    }

    weeklyList (wish, req, res) {
        fs.readFile(configServer.ALLOSERIE_NETFLIX_WEEKLY_LAYOUT, 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            }
            fs.readFile(configServer.ALLOSERIE_NETFLIX_WEEKLY_STORE, 'utf8', function (error,response) {
                if (error) {
                    return console.log(error);
                }
                const netflixEveryWeekData = JSON.parse(response);
                const lastUpdateDate = new Date(netflixEveryWeekData.timeStamp);
                const fullDate = lastUpdateDate.getDate()+'.'+(lastUpdateDate.getMonth()+1)+'.'+lastUpdateDate.getFullYear();
                const fullTime = lastUpdateDate.getHours()+'h'+(lastUpdateDate.getMinutes()<10?'0':'') + lastUpdateDate.getMinutes();
                const fullDateTime = fullDate+' à '+fullTime;
                const metaData = metaService.getMediaMetaData(req.params.media_id,netflixEveryWeekData.items, lastUpdateDate, configServer.ALLOSERIE_NETFLIX_CALENDAR_URL);
                
                var tmpl = dust.compile(data, 'view-netflix');
                dust.loadSource(tmpl);
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
    }
}

module.exports = RoutesControllers;