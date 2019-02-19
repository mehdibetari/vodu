let fs              = require('fs');
let async           = require('async');
let colors          = require('colors');
let imdbScraper     = require('./scrapers/imdb-scraper');
let netflixScraper  = require('./scrapers/netflix-scraper');
let netflixProvider = require('./providers/netflix-provider');

const STORE_FOLDER = './store';
const STORE_NETFLIX_UPCOMING = '/netflix-upcoming';
const languages = ['en', 'fr', 'es', 'pt_br', 'de'];

function itemBuildWithImdbScrap (item, scrap) {
    item.actors    = scrap.actors;
    item.directors = scrap.directors;
    item.creators  = scrap.creators;
    item.summary   = scrap.summary;
    item.mediaLink = scrap.mediaLink;
    item.posterUrl = scrap.posterUrl;
    item.localPath = scrap.localPath;
    return item;
}

function updateUpcoming (newUpcomings, mediasCount, lang, callback) {
    let upComings = [];
    let cpt = 0;
    let postersCpt = 0;
    async.mapSeries(newUpcomings, function(item, done) {
        cpt++;
        console.log('');
        console.log(colors.inverse('#',cpt,'/',mediasCount));
        imdbScraper.getMedia(item.name, getMediaStartYear(item), item.id, true, logger, function(imdbInfos) {
            if (imdbInfos.localPath) postersCpt++;
            item = itemBuildWithImdbScrap(item, imdbInfos);
            if (item.uri) {
                netflixScraper.getPoster(item.uri, item.name, getMediaStartYear(item), item.id, logger, function(netflixPoster) {
                    if (netflixPoster.localPath) postersCpt++;
                    item.posterUrl = netflixPoster.posterUrl || item.posterUrl;
                    item.localPath = netflixPoster.localPath || item.localPath;
                    item.description = netflixPoster.description;
                    upComings.push(item);
                    done();
                });
            }
            else {
                upComings.push(item);
                done();
            }
        });
    }, function() {
        const logTrace = `### Lang: ${lang} POSTER DOWNLOADED => ${postersCpt}/${mediasCount}`
        console.log('');
        console.log(colors.bgYellow.white(logTrace));
        logger(logTrace);
        callback(upComings);
    });
}

function getMediaStartYear (media) {
    if (media.premiereDate === 'upcoming') {
        return new Date().getFullYear();
    }
    if (media.type !== 'series') {
        return media.sortDate.split('-')[0];
    }
    if (media.type === 'series' && media.firstSeason) {
        return Number(media.firstSeason);
    }
    if (media.type === 'series') {
        return Number(media.sortDate.split('-')[0])-(--media.seasons);
    }
}

function saveStore (upComings, language, callback) {
    const file = `${STORE_FOLDER}${STORE_NETFLIX_UPCOMING}/${language}.json`;
    fs.writeFile(file, JSON.stringify(upComings), function(){
        const msg = `File successfully written! - Check your at ${file}`;
        console.log(colors.bgGreen.white(msg));
        logger(msg);
        callback();
    });
}

function refreshNetflixUpcoming () {
    const startMsg = `\NETFLIX REFRESH UPCOMINGS MEDIA STARTED ${Date.now()}`;
    console.log(colors.bgMagenta.white(startMsg));
    logger(startMsg);
    async.mapSeries(languages, function(language, done) {
        netflixProvider.getUpcomingMedia(language, function(netflixUpcoming) {
            console.log(colors.bgWhite.blue('  Medias upcoming Scrapped from NETFLIX Lang', language),colors.bgGreen.white('SUCCESS'),colors.blue(' Total items : ',netflixUpcoming.meta.result.totalItems));
            let newUpcomings = {};
            netflixProvider.getUpcomingMediaManual((upcomingMediaManual) => {
                netflixUpcoming.items = upcomingMediaManual.concat(netflixUpcoming.items);
                updateUpcoming(netflixUpcoming.items, netflixUpcoming.meta.result.totalItems, language, function(items) {
                    newUpcomings.timeStamp = Date.now();
                    newUpcomings.totalItems = netflixUpcoming.meta.result.totalItems;
                    newUpcomings.items = items;
                    saveStore(newUpcomings, language, function () {
                        console.log(colors.bgMagenta.white('NETFLIX REFRESH UPCOMINGS MEDIA ENDED', Date.now()));
                        done();
                    });
                });
            });
        });
    }, function () {
        logger('-----------------------------------');
    });
}

function logger(logTrace) {
    const datetime = new Date();
    const completeLog = `${datetime.toLocaleString()} : ${logTrace}\n`;
    fs.appendFile('./src/refresh-upcomings-logs.txt', completeLog, function(){
        console.log('Trace succefully logged');
    });
}

module.exports = refreshNetflixUpcoming;