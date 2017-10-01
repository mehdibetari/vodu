let fs              = require('fs');
let async           = require('async');
let colors          = require('colors');
let imdbScraper     = require('./scrapers/imdb-scraper');
let netflixScraper  = require('./scrapers/netflix-scraper');
let netflixProvider = require('./providers/netflix-provider');

const STORE_FOLDER = './store';
const STORE_NETFLIX_UPCOMING = '/netflix-upcoming.json';

function getNetflixUpcomingStore (newNetflixUpcoming, callback) {
    if (fs.existsSync(STORE_FOLDER + STORE_NETFLIX_UPCOMING)) {
        fs.readFile(STORE_FOLDER + STORE_NETFLIX_UPCOMING, 'utf8', function (error,netflixUpcomingStore) {
            if (error)  {
                console.log('!!! ERROR on read file '+ STORE_FOLDER + STORE_NETFLIX_UPCOMING + '\n ###ErrorLogStart### ' + error+ '\n ###ErrorLogEnd### ')
                callback(false);
            }
            callback(netflixUpcomingStore);
        });
    }
    else {
        callback({});
    }
}

function compareUpcomings (newUpcomings, oldUpcomings) {
    return JSON.stringify(newUpcomings) === JSON.stringify(oldUpcomings);
}

function updateUpcoming (newUpcomings, oldUpcomings = [], mediasCount, callback) {
    let upComings = [];
    let cpt = 1;
    let postersCpt = 0;
    let metaCpt = 0;
    async.mapSeries(newUpcomings, function(item, done) {
        console.log('');
        console.log(colors.inverse('#',cpt,'/',mediasCount));
        let itemAlreadyExist = oldUpcomings.filter(function(oldItem){
            return oldItem.id === item.id;
        });
        if (itemAlreadyExist.length > 0) {
            item.actors = itemAlreadyExist[0].actors;
            item.director = itemAlreadyExist[0].director;
            item.posterUrl = itemAlreadyExist[0].posterUrl;
            item.summary = itemAlreadyExist[0].summary;
            item.localPath = itemAlreadyExist[0].localPath;
            upComings.push(item);
            done();
        }
        else {
            imdbScraper.getMedia(item.name, getMediaStartYear(item), function(imdbInfos) {
                if (imdbInfos.actors) metaCpt++;
                if (imdbInfos.localPath) postersCpt++;
                item.actors = imdbInfos.actors;
                item.directors = imdbInfos.directors;
                item.posterUrl = imdbInfos.posterUrl;
                item.mediaLink = imdbInfos.mediaLink;
                item.summary = imdbInfos.summary;
                item.localPath = imdbInfos.localPath;
                if (!item.localPath) {
                    netflixScraper.getPoster(item.uri, item.name, getMediaStartYear(item), function(netflixPoster) {
                        if (imdbInfos.localPath) postersCpt++;
                        item.posterUrl = netflixPoster.posterUrl;
                        item.localPath = netflixPoster.localPath;
                        upComings.push(item);
                        done();
                    });
                }
                else {
                    upComings.push(item);
                    done();
                }
            });
        }
        cpt++;
    }, function(e) {
        console.log('');
        console.log(colors.bgYellow.white('POSTER DOWNLOADED =>',postersCpt,'/', mediasCount, ' META SCRAPPED =>',metaCpt,'/', mediasCount));
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
    if (media.type === 'series') {
        return Number(media.sortDate.split('-')[0])-(--media.seasons);
    }
}

function saveStore (upComings) {
    fs.writeFile(STORE_FOLDER + STORE_NETFLIX_UPCOMING, JSON.stringify(upComings), function(err){
        console.log(colors.bgGreen.white('File successfully written! - Check your project directory for the ./store/netflix-upcoming.json file'));
    });
}

function refreshNetflixUpcoming () {
    console.log(colors.bgMagenta.white('\NETFLIX REFRESH UPCOMINGS MEDIA STARTED', Date.now()));
    netflixProvider.getUpcomingMedia(function(netflixUpcoming) {
        // console.log(netflixUpcoming);
        console.log(colors.bgWhite.blue('  Medias upcoming Scrapped from NETFLIX '),colors.bgGreen.white('SUCCESS'),colors.blue(' Total items : ',netflixUpcoming.meta.result.totalItems));
        getNetflixUpcomingStore(netflixUpcoming.items, function(netflixUpcomingStore) {
            let newUpcomings = {};
            let doesntChangeMEssage = colors.bgGreen.white('    ✓ Upcoming doesnt change since last scrpping');
            let hasChangeMessage = colors.yellow('    ✘ Upcomings has changed since the last refresh');
            console.log((compareUpcomings(netflixUpcoming.items, netflixUpcomingStore.items)? doesntChangeMEssage : hasChangeMessage));
            console.log('');
            if (!compareUpcomings(netflixUpcoming.items, netflixUpcomingStore.items)) {
                updateUpcoming(netflixUpcoming.items, netflixUpcomingStore.items, netflixUpcoming.meta.result.totalItems, function(items) {
                    newUpcomings.timeStamp = Date.now();
                    newUpcomings.totalItems = netflixUpcoming.meta.result.totalItems;
                    newUpcomings.items = items;
                    saveStore(newUpcomings);
                    console.log(colors.bgMagenta.white('NETFLIX REFRESH UPCOMINGS MEDIA ENDED', Date.now()));
                });
            }
            else {
                newUpcomings.items = netflixUpcomingStore.items
                newUpcomings.totalItems = netflixUpcomingStore.totalItems;
                newUpcomings.timeStamp = Date.now();
                saveStore(newUpcomings);
                console.log(colors.bgMagenta.white('NETFLIX REFRESH UPCOMINGS MEDIA ENDED', Date.now()));
            }
        });
    });
}

refreshNetflixUpcoming();