var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var async   = require('async');

const imdbBaseUrl = 'http://www.imdb.com';
const imdbSearchStartUrl = '/find?ref_=nv_sr_fn&q=';
const imdbSearchEndUrl = '&s=all';

var imdbData = {};

imdbData.getMovieLink = function (name, year, callback) {
    const url = imdbBaseUrl + 
                imdbSearchStartUrl + 
                encodeURIComponent(name + '+' +year) + 
                imdbSearchEndUrl;
    request(url, function(moviesError, moviesResponse, moviesHtml){
        if(!moviesError) {
            var titleToFound = name + ' (' + year + ')';
            var $ = cheerio.load(moviesHtml);
            // var movieLink = $('.findList tbody tr td a').attr('href');
            // var movieTitle = $('.findList tbody tr td a').text();
            var moviesFounded = $('.findList tbody tr.findResult td.result_text');
            moviesFounded.each(function(){
                // console.log($(this).text().toLowerCase().replace(/\s/g,'') ,' => ', titleToFound.toLowerCase().replace(/\s/g,''));
                if ($(this).text().toLowerCase().replace(/\s/g,'') === titleToFound.toLowerCase().replace(/\s/g,'')) {
                    var movieLink = $(this).find('a').attr('href');
                    // console.log(movieLink);
                    request(imdbBaseUrl + movieLink, function(movieError, movieResponse, movieHtml){
                        if(!movieError) {
                            var $ = cheerio.load(movieHtml);
                            var posterLink = $('.poster img').attr('src');
                            var actors = '';
                            $('.credit_summary_item span[itemprop*="actors"] a span').each(function(i){
                                actors += $(this).text();
                                actors += (i < $('.credit_summary_item span[itemprop*="actors"] a span').length - 1) ? ', ' : '...';
                            });
                            download(posterLink,'./posters/' + name + '+' +year + '.jpg', function () {
                                callback({'actors': actors, 'posterLink': posterLink, 'movieLink': movieLink});
                            });
                        }
                        else {
                            callback({});
                        }
                    });
                    return false;
                }
            });

        }
        else {
            callback({});
        }
    });

};
var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
        // console.log('content-type:', res.headers['content-type']);
        // console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};
  
imdbData.getMovieLink('inception','2010', function (movieData) {
    setTimeout(function(){ console.log('MOVIE', movieData); }, 1000);
    imdbData.getMovieLink('interstellar','2014', function (movieData) {
        setTimeout(function(){ console.log('MOVIE', movieData); }, 1000);
        imdbData.getMovieLink('memento','2000', function (movieData) {
            setTimeout(function(){ console.log('MOVIE', movieData); }, 1000);
            imdbData.getMovieLink('The Dark Knight Rises','2012', function (movieData) {
                setTimeout(function(){ console.log('MOVIE', movieData); }, 1000);
                imdbData.getMovieLink('The Dark Knight','2008', function (movieData) {
                    setTimeout(function(){ console.log('MOVIE', movieData); }, 1000);
                    imdbData.getMovieLink('Le prestige','2006', function (movieData) {
                        setTimeout(function(){ console.log('MOVIE', movieData); }, 1000);
                        imdbData.getMovieLink('Batman Begins','2005', function (movieData) {
                            setTimeout(function(){ console.log('MOVIE', movieData); }, 1000);
                            imdbData.getMovieLink('Dunkerque','2017', function (movieData) {
                                setTimeout(function(){ console.log('MOVIE', movieData); }, 1000);
                                imdbData.getMovieLink('Man of Steel','2013', function (movieData) {
                                    setTimeout(function(){ console.log('MOVIE', movieData); }, 1000);
                                    imdbData.getMovieLink('Le loup de Wall Street','2013', function (movieData) {
                                        setTimeout(function(){ console.log('MOVIE', movieData); }, 1000);
                                        imdbData.getMovieLink('Django Unchained','2012', function (movieData) {
                                            setTimeout(function(){ console.log('MOVIE', movieData); }, 1000);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});