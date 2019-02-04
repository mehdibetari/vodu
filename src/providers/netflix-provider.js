let request = require('request');
let fs      = require('fs');

const NETFLIX_BASE_URL = 'https://media.netflix.com';
const NETFLIX_API_PATH = '/gateway/v1';
const NETFLIX_UPCOMING_PATH = 'titles/upcoming';
const NETFLIX_UPCOMING_MANUAL_JSON = './store/netflix-upcoming-manual.json';

function getUpcomingMedia (lang, callback) {
    const langPath = lang ? '/fr' : `/${lang}`;
    request(`${NETFLIX_BASE_URL}${NETFLIX_API_PATH}${langPath}${NETFLIX_UPCOMING_PATH}`, function(error, response) {
        var netflixUpcomings = JSON.parse(response.body)
        if(error || !netflixUpcomings.items || !netflixUpcomings.meta.result.totalItems) {
            console.log('Error : ', error);
            console.log('Response : ', response);
            return;
        }
        callback(netflixUpcomings);
    });
}

function getUpcomingMediaManual (callback) {
    fs.readFile(NETFLIX_UPCOMING_MANUAL_JSON, 'utf8', (error, response) => {
        var netflixUpcomings = JSON.parse(response);
        if(error || !netflixUpcomings) {
            console.log('Error : ', error);
            console.log('Response : ', response);
            return;
        }
        callback(netflixUpcomings);
    });
}

exports.getUpcomingMedia = getUpcomingMedia;
exports.getUpcomingMediaManual = getUpcomingMediaManual;