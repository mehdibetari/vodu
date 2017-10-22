let fs              = require('fs');
let async           = require('async');
let colors          = require('colors');
let prompt          = require('prompt');
const argv          = require('yargs').argv;
let imdbScraper     = require('./scrapers/imdb-scraper');
let netflixScraper  = require('./scrapers/netflix-scraper');
let netflixProvider = require('./providers/netflix-provider');
const Filestorage   = require('./media-storage/Filestorage');
let Firestore       = require('./media-store/Firestore');
let Media           = require('./media-store/Media');

const STORE_FOLDER = './store';
const STORE_NETFLIX_UPCOMING = '/netflix-upcoming.json';
const uploadcare = argv.upc;
refreshNetflixUpcoming(uploadcare);

function updateUpcoming (newUpcomings, mediasCount, uploadcare, callback) {
    let upComings = [];
    let cpt = 1;
    let postersCpt = 0;
    let metaCpt = 0;
    let posterStore = new Filestorage();
    let mediaStore = new Firestore();
    const mediaFrom = 'netflix-upcomings';
    async.mapSeries(newUpcomings, function(item, done) {
        console.log('');
        console.log(colors.inverse('#',cpt,'/',mediasCount));
        let itemMedia = new Media(item, mediaFrom);
        mediaStore.getMedia(itemMedia, function(itemAlreadyExist, error){
            if (itemAlreadyExist && itemAlreadyExist.poster && ~itemAlreadyExist.poster.length) {
                console.log(colors.inverse('poster ALREADY downloaded'),colors.bgGreen.white(item.name, getMediaStartYear(item)));
                postersCpt++;
                item.posterUrl = itemAlreadyExist.poster.map((poster) => poster.from === mediaFrom).value;
                item.localPath = itemAlreadyExist.poster.map((poster) => poster.from === 'own-cloud-storage').value;
                if (itemAlreadyExist.actors && (itemAlreadyExist.directors || itemAlreadyExist.creators || itemAlreadyExist.summary)) {
                    console.log(colors.inverse('meta ALREADY founded'),colors.bgGreen.white(item.name, getMediaStartYear(item)));
                    metaCpt++;
                    item.actors = itemAlreadyExist.actors;
                    item.directors = itemAlreadyExist.directors;
                    item.creators = itemAlreadyExist.creators;
                    item.summary = itemAlreadyExist.summary;
                    upComings.push(item);
                    let updatedMedia = new Media(item, mediaFrom);
                    mediaStore.setMedia(updatedMedia, function(error){
                        if (error) console.log('Updated Item failed to put in Firestore error: ', error);
                        done();
                    });
                }
                else {
                    imdbScraper.getMedia(item.name, getMediaStartYear(item), false, uploadcare, function(imdbInfos) {
                        if (imdbInfos.actors) metaCpt++;
                        item.actors = imdbInfos.actors;
                        item.directors = imdbInfos.directors;
                        item.creators = imdbInfos.creators;
                        item.summary = imdbInfos.summary;
                        upComings.push(item);
                        let updatedMedia = new Media(item, mediaFrom);
                        mediaStore.setMedia(updatedMedia, function(error){
                            if (error) console.log('Updated Item failed to put in Firestore error: ', error);
                            done();
                        });
                    });
                }
            }
            else {
                imdbScraper.getMedia(item.name, getMediaStartYear(item), true, uploadcare, function(imdbInfos) {
                    if (imdbInfos.actors) metaCpt++;
                    if (imdbInfos.localPath) postersCpt++;
                    item.actors = imdbInfos.actors;
                    item.directors = imdbInfos.directors;
                    item.creators = imdbInfos.creators;
                    item.posterUrl = imdbInfos.posterUrl;
                    item.mediaLink = imdbInfos.mediaLink;
                    item.summary = imdbInfos.summary;
                    item.localPath = imdbInfos.localPath;
                    if (!item.localPath) {
                        netflixScraper.getPoster(item.uri, item.name, getMediaStartYear(item), uploadcare, function(netflixPoster) {
                            if ((!argv.prt) || (argv.prt && imdbInfos.localPath)) {
                                postersCpt++;
                                item.posterUrl = netflixPoster.posterUrl;
                                item.localPath = netflixPoster.localPath;
                                upComings.push(item);
                                let updatedMedia = new Media(item, mediaFrom);
                                mediaStore.setMedia(updatedMedia, function(error){
                                    if (error) console.log('Updated Item failed to post in Firestore error: ', error);
                                    done();
                                });
                            }
                            else {
                                prompt.start();
                                prompt.message = colors.rainbow('Enter manualy');
                                prompt.get(['posterUrl'], function (err, result) {
                                    posterStore.download(result.posterUrl,'./public/posters/' + item.name + '+' + getMediaStartYear(item) + '.jpg', uploadcare, function (path) {
                                        console.log('Command-line posterUrl received:',result.posterUrl);
                                        if (path) postersCpt++;
                                        item.posterUrl = path;
                                        item.localPath = result.posterUrl;
                                        upComings.push(item);
                                        let updatedMedia = new Media(item, mediaFrom);
                                        mediaStore.setMedia(updatedMedia, function(error){
                                            if (error) console.log('Updated Item failed to post in Firestore after prompt error: ', error);
                                            done();
                                        });
                                    });
                                });
                            }
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
            cpt++;
        });
    }, function() {
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

function refreshNetflixUpcoming (uploadcare) {
    console.log(colors.bgMagenta.white('\NETFLIX REFRESH UPCOMINGS MEDIA STARTED', Date.now()));
    netflixProvider.getUpcomingMedia(function(netflixUpcoming) {
        // console.log(netflixUpcoming);
        console.log(colors.bgWhite.blue('  Medias upcoming Scrapped from NETFLIX '),colors.bgGreen.white('SUCCESS'),colors.blue(' Total items : ',netflixUpcoming.meta.result.totalItems));
        let newUpcomings = {};
        updateUpcoming(netflixUpcoming.items, netflixUpcoming.meta.result.totalItems, uploadcare, function(items) {
            newUpcomings.timeStamp = Date.now();
            newUpcomings.totalItems = netflixUpcoming.meta.result.totalItems;
            newUpcomings.items = items;
            saveStore(newUpcomings);
            console.log(colors.bgMagenta.white('NETFLIX REFRESH UPCOMINGS MEDIA ENDED', Date.now()));
        });
    });
}