var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var async   = require('async');

const imdbBaseUrl = 'http://www.imdb.com';
const imdbSearchStartUrl = '/find?ref_=nv_sr_fn&q=';
const imdbSearchEndUrl = '&s=all';

var getMovieLink = function (name, year, callback) {
    const url = imdbBaseUrl + 
                imdbSearchStartUrl + 
                encodeURIComponent(name + '+' +year) + 
                imdbSearchEndUrl;
    var lock = false;
    request(url, function(moviesError, moviesResponse, moviesHtml){
        if(!moviesError) {
            var titleToFound = name + ' (' + year + ')';
            var $ = cheerio.load(moviesHtml);
            // var movieLink = $('.findList tbody tr td a').attr('href');
            // var movieTitle = $('.findList tbody tr td a').text();
            var moviesFounded = $('.findList tbody tr.findResult td.result_text');
            if (!moviesFounded || moviesFounded.length < 1) callback({});
            async.eachSeries(moviesFounded, function(movie){
                console.log($(movie).text().toLowerCase().replace(/\s/g,'') ,' => ', titleToFound.toLowerCase().replace(/\s/g,''));
                // console.log($(movie).text().toLowerCase().replace(/\s/g,'').indexOf(titleToFound.toLowerCase().replace(/\s/g,'')) );
                var textExactlyMatch = $(movie).text().toLowerCase().replace(/\s/g,'') === titleToFound.toLowerCase().replace(/\s/g,'');
                var textExactlyStart = $(movie).text().toLowerCase().replace(/\s/g,'').indexOf(titleToFound.toLowerCase().replace(/\s/g,'')) === 0;
                if (!lock && textExactlyMatch || textExactlyStart) {
                    lock = true;
                    var movieLink = $(movie).find('a').attr('href');
                    console.log('##############SCRAPE : ',name, ' => ',movieLink);
                    request(imdbBaseUrl + movieLink, function(movieError, movieResponse, movieHtml){
                        if(!movieError) {
                            var $ = cheerio.load(movieHtml);
                            var posterUrl = $('.poster img').attr('src');
                            var actors = '';
                            $('.credit_summary_item span[itemprop*="actors"] a span').each(function(i){
                                actors += $(this).text();
                                actors += (i < $('.credit_summary_item span[itemprop*="actors"] a span').length - 1) ? ', ' : '...';
                            });
                            var directors = '';
                            $('.credit_summary_item span[itemprop*="director"] a span').each(function(i){
                                directors += $(this).text();
                                directors += (i < $('.credit_summary_item span[itemprop*="director"] a span').length - 1) ? ', ' : '...';
                            });
                            var creators = '';
                            $('.credit_summary_item span[itemprop*="creator"] a span').each(function(i){
                                creators += $(this).text();
                                creators += (i < $('.credit_summary_item span[itemprop*="creator"] a span').length - 1) ? ', ' : '...';
                            });
                            download(posterUrl,'./posters/' + name + '+' +year + '.jpg', function () {
                                callback({'actors': actors, 'posterUrl': posterUrl, 'movieLink': movieLink, 'directors': directors, 'creators': creators});
                            });
                        }
                        else {
                            callback({});
                        }
                    });
                    return false;
                }
                else {
                    callback({});
                }
            });

        }
        else {
            callback({});
        }
    });

};
var download = function(uri, filename, callback){
    if (!uri) return callback();
    request.head(uri, function(err, res, body){
        // console.log('content-type:', res.headers['content-type']);
        // console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

// imdbData.getMovieLink('The Good Place','2016', function (movieData) {
//     setTimeout(function(){ console.log('MOVIE', movieData); }, 1000);
// });


// imdbData.getMovieLink('inception','2010', function (movieData) {
//     setTimeout(function(){ console.log('MOVIE', movieData); }, 1000);
//     imdbData.getMovieLink('interstellar','2014', function (movieData) {
//         setTimeout(function(){ console.log('MOVIE', movieData); }, 1000);
//         imdbData.getMovieLink('memento','2000', function (movieData) {
//             setTimeout(function(){ console.log('MOVIE', movieData); }, 1000);
//             imdbData.getMovieLink('The Dark Knight Rises','2012', function (movieData) {
//                 setTimeout(function(){ console.log('MOVIE', movieData); }, 1000);
//                 imdbData.getMovieLink('The Dark Knight','2008', function (movieData) {
//                     setTimeout(function(){ console.log('MOVIE', movieData); }, 1000);
//                     imdbData.getMovieLink('Le prestige','2006', function (movieData) {
//                         setTimeout(function(){ console.log('MOVIE', movieData); }, 1000);
//                         imdbData.getMovieLink('Batman Begins','2005', function (movieData) {
//                             setTimeout(function(){ console.log('MOVIE', movieData); }, 1000);
//                             imdbData.getMovieLink('Dunkerque','2017', function (movieData) {
//                                 setTimeout(function(){ console.log('MOVIE', movieData); }, 1000);
//                                 imdbData.getMovieLink('Man of Steel','2013', function (movieData) {
//                                     setTimeout(function(){ console.log('MOVIE', movieData); }, 1000);
//                                     imdbData.getMovieLink('Le loup de Wall Street','2013', function (movieData) {
//                                         setTimeout(function(){ console.log('MOVIE', movieData); }, 1000);
//                                         imdbData.getMovieLink('Django Unchained','2012', function (movieData) {
//                                             setTimeout(function(){ console.log('MOVIE', movieData); }, 1000);
//                                             imdbData.getMovieLink('The Good Place','2016', function (movieData) {
//                                                 setTimeout(function(){ console.log('MOVIE', movieData); }, 1000);
//                                             });
//                                         });
//                                     });
//                                 });
//                             });
//                         });
//                     });
//                 });
//             });
//         });
//     });
// });
// imdbData.getMovieLink = function (name, year, callback) {
//     const url = googleSearchBaseUrl + 
//                     encodeURIComponent(name + ' ' +year) + 
//                     imdbGoogleSearchParam + 
//                     encodeURIComponent(name + ' ' +year);
//     request(url, function(error, response, html){
//         if(!error){
//             var $ = cheerio.load(html);
//             var text = $('.g h3 a').html();
//             var link = $('.g h3 a').attr('href');
//             console.log('IMDB::::',text,link,html);
//             if (text && text.indexOf(name) > -1 && text.indexOf(year) > -1) {
//                 callback(link.replace('/url?q=',''));
//             }
//             else {
//                 callback(false);
//             }
//         }
//     });

// };

exports.getMovieLink = getMovieLink;