var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var async   = require('async');

const googleSearchBaseUrl = 'https://www.google.fr/search?q=';
const imdbGoogleSearchParam = '%20site%3Aimdb.com&oq=';

var imdbData = {};

imdbData.getMovieLink = function (name, year, callback) {
    const url = googleSearchBaseUrl + 
                    encodeURIComponent(name + ' ' +year) + 
                    imdbGoogleSearchParam + 
                    encodeURIComponent(name + ' ' +year);
    request(url, function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);
            var text = $('.g h3 a').html();
            var link = $('.g h3 a').attr('href');
            if (text.indexOf(name) > -1 && text.indexOf(year) > -1) {
                callback(link.replace('/url?q=',''));
            }
            else {
                callback(false);
            }
        }
    });

};

imdbData.getMovieId('inception','2010');