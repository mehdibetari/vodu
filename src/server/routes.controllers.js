'use strict';
let dust    = require('dustjs-linkedin');
let fs      = require('fs');
let metaService = require('./meta.service');
let configServer = require('./config-server').configServer;
const Packager = require('../xspeedit/XspeedIt');
const configKeys = require('../config-keys');
const upcomings = require('../refresh-upcoming');
const atob = require('atob');

class RoutesControllers {
    constructor() {
    }

    getAbbrMonth() {
        return ['jan.', 'fev.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'aout', 'sept.', 'oct.', 'nov.', 'dec.'];
    }

    getMonth() {
        return ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre'];
    }

    calendarList (wish, req, res) {
        switch(wish) {
        case 'netflix':
            fs.readFile(configServer.ALLOSERIE_NETFLIX_CALENDAR_LAYOUT, 'utf8', (err,data) => {
                if (err) {
                    return console.log(err);
                }
                fs.readFile(configServer.ALLOSERIE_NETFLIX_UPCOMING_STORE, 'utf8', (error,response) => {
                    if (error) {
                        return console.log(error);
                    }
                    const netflixUpcoming = JSON.parse(response);
                    netflixUpcoming.items.sort((a,b) => new Date(a.sortDate).getTime() - new Date(b.sortDate).getTime());
                    netflixUpcoming.items = this.removeMediaFromPreviousYear(netflixUpcoming.items);

                    const lastUpdateDate = new Date(netflixUpcoming.timeStamp);
                    const fullDate = lastUpdateDate.getDate()+'.'+(lastUpdateDate.getMonth()+1)+'.'+lastUpdateDate.getFullYear()+' à '+lastUpdateDate.getHours()+'h'+lastUpdateDate.getMinutes();
                    const frenchDate = `${lastUpdateDate.getDate()} ${this.getAbbrMonth()[lastUpdateDate.getMonth()]} ${lastUpdateDate.getFullYear()}`;
                    const currentMonth = this.getMonth()[lastUpdateDate.getMonth()];
                    const metaData = metaService.getMediaMetaData(req.params.media_id,netflixUpcoming.items, lastUpdateDate, configServer.ALLOSERIE_NETFLIX_CALENDAR_URL);
                    const structuredData = metaService.getStructuredData(this.filterMediaWithPicture(netflixUpcoming.items), configServer.ALLOSERIE_NETFLIX_CALENDAR_URL);

                    let tmpl = dust.compile(data, 'view-netflix');
                    dust.filters.unicorn = function(value) {
                        if (typeof value === 'string') {
                           return value.replace('/posters/./public/posters/', '/posters/');
                         }
                         return value;
                    };
                    dust.loadSource(tmpl);
                    let view = dust.render('view-netflix', { 
                        list: netflixUpcoming.items, 
                        lastUpdate: fullDate,
                        humanDate: {
                            frenchDate,
                            currentMonth,
                            currentYear: lastUpdateDate.getFullYear(),
                            nextYear: lastUpdateDate.getFullYear() + 1
                        },
                        meta: metaData,
                        structuredData
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
        case 'json-netflix':
            fs.readFile(configServer.ALLOSERIE_NETFLIX_UPCOMING_STORE, 'utf8', function (error,response) {
                if (error) {
                    return console.log(error);
                }
                res.setHeader('Content-Type', 'application/json');
                res.send(response);
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
                const metaData = metaService.getMediaMetaData(req.params.media_id,netflixEveryWeekData.items, lastUpdateDate, configServer.ALLOSERIE_NETFLIX_WEEKLY_URL);
                metaData.frenchDate = `${lastUpdateDate.getDate()} ${this.getAbbrMonth()[lastUpdateDate.getMonth()]} ${lastUpdateDate.getFullYear()}`;
                
                let tmpl = dust.compile(data, 'view-netflix');
                dust.loadSource(tmpl);
                let view = dust.render('view-netflix', { 
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

    home (req, res) {
        fs.readFile(configServer.ALLOSERIE_HOME_LAYOUT, 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            }
            const lastUpdateDate = new Date();
            const fullDate = (lastUpdateDate.getDate()-1)+'.'+(lastUpdateDate.getMonth()+1)+'.'+lastUpdateDate.getFullYear();

            let tmpl = dust.compile(data, 'view-netflix');
            dust.loadSource(tmpl);
            let view = dust.render('view-netflix', {lastUpdate: fullDate}, function(e, out) {
                if(e) {
                    console.error(e);
                } else {
                    // Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
                    res.send(out);
                }
            });
        });
    }

    xspeedit (req, res) {
        const packagerInstance = new Packager(req.params.input);
        res.setHeader('Content-Type', 'application/json');
        res.send({'packagedBoxes': packagerInstance.getBoxes(), 'count': packagerInstance.getBoxes().length});
    }

    refreshUpcomings (req, res) {
        let badParam = false;
        if (!req.params.key) {
            badParam = true;
        }
        else {
            const key = atob(req.params.key);;
            if (key === configKeys.secretApi['private_key']) {
                upcomings(true);
                res.status(200).send('In progress');
            }
            else {
                badParam = true;
            }

        }
        if (badParam) res.status(404).send('Not found');
    }

    removeMediaFromPreviousYear (medias) {
        return medias.filter((item) => new Date(item.sortDate).getFullYear() != new Date().getFullYear() - 1);
    }

    filterMediaWithPicture(medias) {
        return medias.filter((item) => item.posterUrl);
    }
}

module.exports = RoutesControllers;