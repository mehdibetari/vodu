var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var async   = require('async');
let colors = require('colors');
var imdb = require('./scrape-imdb-film-data');

const NETFLIX_BASE_URL = 'https://media.netflix.com';
const NETFLIX_UPCOMING_PATH = '/gateway/v1/fr/titles/upcoming';
const STORE_FOLDER = './store';
const STORE_NETFLIX_UPCOMING = '/netflix-upcoming.json';

function getNetflixUpcoming (callback) {
    request(NETFLIX_BASE_URL + NETFLIX_UPCOMING_PATH, function(error, response) {
        var netflixUpcomings = JSON.parse(response.body)
        if(error || !netflixUpcomings.items || !netflixUpcomings.meta.result.totalItems) {
            console.log('Error : ', error);
            console.log('Response : ', response);
            return;
        }
        callback(netflixUpcomings);
    });
}

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
        callback(false);
    }
}

function compareUpcomings (newUpcomings, oldUpcomings) {
    return JSON.stringify(newUpcomings) === JSON.stringify(oldUpcomings);
}

function updateUpcoming (newUpcomings, oldUpcomings = [], mediasCount, callback) {
    var upComings = [];
    let cpt = 1;
    let postersCpt = 0;
    let metaCpt = 0;
    async.mapSeries(newUpcomings, function(item, done) {
        console.log('');
        console.log(colors.inverse('#',cpt,'/',mediasCount));
        var itemAlreadyExist = oldUpcomings.filter(function(oldItem){
            return oldItem.id === item.id;
        });
        if (itemAlreadyExist.length > 0) {
            item.actors = itemAlreadyExist[0].actors;
            item.director = itemAlreadyExist[0].director;
            item.posterUrl = itemAlreadyExist[0].posterUrl;
            upComings.push(item);
            done();
        }
        else {
            imdb.getMedia(item.name, getMediaStartYear(item), function(imdbInfos) {
                if (imdbInfos.actors) metaCpt++;
                if (imdbInfos.posterUrl) postersCpt++;
                item.actors = imdbInfos.actors;
                item.directors = imdbInfos.directors;
                item.posterUrl = imdbInfos.posterUrl;
                item.mediaLink = imdbInfos.mediaLink;
                upComings.push(item);
                done();
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
    getNetflixUpcoming(function(netflixUpcoming) {
        // console.log(netflixUpcoming);
        console.log(colors.bgWhite.blue('  Medias upcoming Scrapped from NETFLIX '),colors.bgGreen.white('SUCCESS'),colors.blue(' Total items : ',netflixUpcoming.meta.result.totalItems));
        getNetflixUpcomingStore(netflixUpcoming.items, function(netflixUpcomingStore) {
            var newUpcomings = {};
            let doesntChangeMEssage = colors.bgGreen.white('    ✓ Upcoming doesnt change since last scrpping');
            let hasChangeMessage = colors.yellow('    ✘ Upcomings has changed since the last refresh');
            console.log((compareUpcomings(netflixUpcoming.items, netflixUpcomingStore.items)? doesntChangeMEssage : hasChangeMessage));
            console.log('');
            if (!compareUpcomings(netflixUpcoming.items, netflixUpcomingStore.items)) {
                updateUpcoming(netflixUpcoming.items, netflixUpcomingStore.items, netflixUpcoming.meta.result.totalItems, function(items) {
                    newUpcomings.timeStamp = Date.now();
                    newUpcomings.items = items;
                    saveStore(newUpcomings);
                    console.log(colors.bgMagenta.white('NETFLIX REFRESH UPCOMINGS MEDIA ENDED', Date.now()));
                });
            }
            else {
                newUpcomings.items = netflixUpcomingStore.items
                newUpcomings.timeStamp = Date.now();
                saveStore(newUpcomings);
                console.log(colors.bgMagenta.white('NETFLIX REFRESH UPCOMINGS MEDIA ENDED', Date.now()));
            }
        });
    });
}

refreshNetflixUpcoming();


    // var newItems = [];
    // var cpt = 0;

    // async.mapSeries(NetflixUpcoming.items, function(item, done){
    //     if (item.uri) {
    //         cpt++;
    //         request(NETFLIX_BASE_URL+item.uri, function(error, response, html){
        
    //             if(!error){
    //                 var $ = cheerio.load(html);
                    
    //                 var imgSrc;
    //                 var json = { imgSrc : ''};
                    
    //                 $('img','.nfo-poster-img-container').filter(function(){
    //                     var imgTemp = ($(this).attr('src') === '/dist/img/no-key-art.jpg') ? false : $(this).attr('src');
    //                     if (imgTemp) {
    //                         item.imgUrl = imgTemp;
    //                         newItems.push(item);
    //                         done();
    //                     }
    //                     else {
    //                         imdbData.getMedia(item.name, item.sortDate, function (imdbmediaLink) {
    //                             item.imdbmediaLink = imdbmediaLink;
    //                             newItems.push(item);
    //                             done();
    //                         });
    //                     }
    //                     console.log(cpt, '/', NetflixUpcoming.items.length,' ############ :: ', item.imgUrl);
    //                 });
    //             }
    //         });
    //     }
    // }, function(err, NetflixUpcoming) {
    //     fs.writeFile('./output/netflix-upcoming.json', JSON.stringify(newItems), function(err){
    //         console.log('File successfully written! - Check your project directory for the ./output/netflix-upcoming.json file');
    //     });
    // });
    
    // To write to the system we will use the built in 'fs' library.
    // In this example we will pass 3 parameters to the writeFile function
    // Parameter 1 :  ./output/netflix-upcoming.json - this is what the created filename will be called
    // Parameter 2 :  JSON.stringify(json, null, 4) - the data to write, here we do an extra step by calling JSON.stringify to make our JSON easier to read
    // Parameter 3 :  callback function - a callback function to let us know the status of our function
        

// });