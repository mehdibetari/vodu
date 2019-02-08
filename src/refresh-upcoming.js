let fs              = require('fs');
let async           = require('async');
let colors          = require('colors');
let prompt          = require('prompt');
let imdbScraper     = require('./scrapers/imdb-scraper');
let netflixScraper  = require('./scrapers/netflix-scraper');
let netflixProvider = require('./providers/netflix-provider');
const Filestorage   = require('./media-storage/Filestorage');
let Firestore       = require('./media-store/Firestore');
let Media           = require('./media-store/Media');

const STORE_FOLDER = './store';
const STORE_NETFLIX_UPCOMING = '/netflix-upcoming';
let argv = {};
let uploadcare = false;
const languages = ['fr', 'en', 'es', 'pt_br', 'de'];

function getDataFrom(from, Datas = []) {
    if (!~Datas.length) return '';
    var Data = Datas.filter(data => data.from === from);
    if (!Data[0] || !Data[0].value) return '';
    return Data[0].value || '';
}

function itemPatchWithExisting (item, existing, from) {
    item.posterUrl    = getDataFrom(from, existing.poster);
    item.localPath    = getDataFrom('own-cloud-storage', existing.poster);
    item.mediaLink    = getDataFrom(from, existing.link);
    item.actors       = existing.actors;
    item.directors    = existing.directors;
    item.creators     = existing.creators;
    item.summary      = existing.summary;
    item.premiereDate = existing.premiereDate;
    item.seasons      = existing.seasons;
    item.sortDate     = existing.sortDate;
    return item;
}

function itemPatchWithImdbScrap (item, scrap) {
    item.actors    = item.actors    || scrap.actors;
    item.directors = item.directors || scrap.directors;
    item.creators  = item.creators  || scrap.creators;
    item.summary   = item.summary   || scrap.summary;
    item.posterUrl = item.posterUrl || scrap.posterUrl;
    item.localPath = item.localPath || scrap.localPath;
    item.mediaLink = item.mediaLink || scrap.mediaLink;
    return item;
}

function itemBuildWithImdbScrapOrExisting (item, scrap, existing = {}) {
    item.actors    = scrap.actors    || existing.actors;
    item.directors = scrap.directors || existing.directors;
    item.creators  = scrap.creators  || existing.creators;
    item.summary   = scrap.summary   || existing.summary;
    item.mediaLink = scrap.mediaLink || existing.mediaLink;
    item.posterUrl = scrap.posterUrl;
    item.localPath = scrap.localPath;
    return item;
}

function mediaAlreadyExistWithPoster (item, itemAlreadyExist, mediaFrom, mediaStore, callback) {
    console.log(colors.inverse('poster ALREADY downloaded'),colors.bgGreen.white(item.name, getMediaStartYear(item)));
    item = itemPatchWithExisting(item, itemAlreadyExist, mediaFrom);
    var minActorsAndOneMeta = item.actors && (item.directors || item.creators || item.summary);
    if (minActorsAndOneMeta) {
        console.log(colors.inverse('meta ALREADY founded'),colors.bgGreen.white(item.name, getMediaStartYear(item)));
        callback(item);
    }
    else {
        imdbScraper.getMedia(item.name, getMediaStartYear(item), false, uploadcare, function(imdbInfos) {
            console.log(colors.inverse('meta UNFINISHED'),colors.bgRed.white(item.name, getMediaStartYear(item)));
            item = itemPatchWithImdbScrap(item, imdbInfos);
            let updatedMedia = new Media(item, mediaFrom);
            mediaStore.setMedia(updatedMedia, function(error){
                if (error) console.log('Updated Item failed to put in Firestore error: ', error);
                callback(item);
            });
        });
    }
}

function updateUpcoming (newUpcomings, mediasCount, uploadcare, callback) {
    let upComings = [];
    let cpt = 0;
    let postersCpt = 0;
    let mediaStore = new Firestore();
    const mediaFrom = 'netflix-upcomings';
    async.mapSeries(newUpcomings, function(item, done) {
        cpt++;
        console.log('');
        console.log(colors.inverse('#',cpt,'/',mediasCount));
        let itemMedia = new Media(item, mediaFrom);
        mediaStore.getMedia(itemMedia, function(itemAlreadyExist){
            
            var minOnePoster = itemAlreadyExist && itemAlreadyExist.poster && ~itemAlreadyExist.poster.length;
            if (minOnePoster) {
                mediaAlreadyExistWithPoster(item, itemAlreadyExist, mediaFrom, mediaStore, function(item){
                    upComings.push(item);
                    done();
                });
            }
            else {
                imdbScraper.getMedia(item.name, getMediaStartYear(item), true, uploadcare, function(imdbInfos) {
                    if (imdbInfos.localPath) postersCpt++;
                    item = itemBuildWithImdbScrapOrExisting(item, imdbInfos, itemAlreadyExist || {});
                    if (!item.localPath) {
                        trySearchPosterOnNetflixOrPrompt(item, imdbInfos, uploadcare, function(){
                            upComings.push(item);
                            let updatedMedia = new Media(item, mediaFrom);
                            mediaStore.setMedia(updatedMedia, function(error){
                                if (error) console.log('Updated Item failed to post in Firestore after prompt error: ', error);
                                done();
                            });
                        });
                    }
                    else {
                        upComings.push(item);
                        let updatedMedia = new Media(item, mediaFrom);
                        mediaStore.setMedia(updatedMedia, function(error){
                            if (error) console.log('Updated Item failed to post in Firestore error: ', error);
                            done();
                        });
                    }
                });
            }
        });
    }, function() {
        console.log('');
        console.log(colors.bgYellow.white('POSTER DOWNLOADED =>',postersCpt,'/', mediasCount));
        callback(upComings);
    });
}

function trySearchPosterOnNetflixOrPrompt (item, imdbInfos, uploadcare, callback) {
    
    netflixScraper.getPoster(item.uri, item.name, getMediaStartYear(item), uploadcare, function(netflixPoster) {
        if ((!argv.prt) || (argv.prt && imdbInfos.localPath)) {
            item.posterUrl = netflixPoster.posterUrl;
            item.localPath = netflixPoster.localPath;
            callback(item);
        }
        else {
            prompt.start();
            prompt.message = colors.rainbow('Enter manualy');
            prompt.get(['posterUrl'], function (err, result) {
                let posterStore = new Filestorage();
                posterStore.download(result.posterUrl,'./public/posters/' + item.name.replace('/','') + '+' + getMediaStartYear(item) + '.jpg', uploadcare, function (path) {
                    console.log('Command-line posterUrl received:',result.posterUrl);
                    item.posterUrl = path;
                    item.localPath = result.posterUrl;
                    callback(item);
                });
            });
        }
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

function saveStore (upComings, language) {
    const file = `${STORE_FOLDER}${STORE_NETFLIX_UPCOMING}/${language}.json`;
    fs.writeFile(file, JSON.stringify(upComings), function(){
        console.log(colors.bgGreen.white('File successfully written! - Check your project directory for the ./store/netflix-upcoming.json file'));
    });
}

function refreshNetflixUpcoming (upc, prompt) {
    argv.prt = prompt;
    uploadcare = upc;
    console.log(colors.bgMagenta.white('\NETFLIX REFRESH UPCOMINGS MEDIA STARTED', Date.now()));
    async.mapSeries(languages, function(language, done) {
        netflixProvider.getUpcomingMedia(language, function(netflixUpcoming) {
            // console.log(netflixUpcoming);
            console.log(colors.bgWhite.blue('  Medias upcoming Scrapped from NETFLIX '),colors.bgGreen.white('SUCCESS'),colors.blue(' Total items : ',netflixUpcoming.meta.result.totalItems));
            let newUpcomings = {};
            netflixProvider.getUpcomingMediaManual((upcomingMediaManual) => {
                netflixUpcoming.items = upcomingMediaManual.concat(netflixUpcoming.items);
                updateUpcoming(netflixUpcoming.items, netflixUpcoming.meta.result.totalItems, uploadcare, function(items) {
                    newUpcomings.timeStamp = Date.now();
                    newUpcomings.totalItems = netflixUpcoming.meta.result.totalItems;
                    newUpcomings.items = items;
                    saveStore(newUpcomings, language);
                    console.log(colors.bgMagenta.white('NETFLIX REFRESH UPCOMINGS MEDIA ENDED', Date.now()));
                    done();
                });
            });
        });
    });
}

module.exports = refreshNetflixUpcoming;