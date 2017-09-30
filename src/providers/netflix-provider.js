var request = require('request');

const NETFLIX_BASE_URL = 'https://media.netflix.com';
const NETFLIX_UPCOMING_PATH = '/gateway/v1/fr/titles/upcoming';

function getUpcomingMedia (callback) {
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

exports.getUpcomingMedia = getUpcomingMedia;