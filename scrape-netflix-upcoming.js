var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var async   = require('async');
// var imdbData = require('./scrape-imdb-film-data');

const baseUrl = 'https://media.netflix.com';
const url = 'https://media.netflix.com/gateway/v1/fr/titles/upcoming';
// const googleSearchBaseUrl = 'https://www.google.fr/search?q=';
// const imdbGoogleSearchParam = '%20site%3Aimdb.com&oq=';

const imdbBaseUrl = 'http://www.imdb.com';
const imdbSearchStartUrl = '/find?ref_=nv_sr_fn&q=';
const imdbSearchEndUrl = '&s=all';

var imdbData = {};
var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
        // console.log('content-type:', res.headers['content-type']);
        // console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

imdbData.getMovieLink = function (name, year, callback) {
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
            async.eachSeries(moviesFounded, function(movie){
                // console.log($(movie).text().toLowerCase().replace(/\s/g,'') ,' => ', titleToFound.toLowerCase().replace(/\s/g,''));
                // console.log($(movie).text().toLowerCase().replace(/\s/g,'').indexOf(titleToFound.toLowerCase().replace(/\s/g,'')) );
                var textExactlyMatch = $(movie).text().toLowerCase().replace(/\s/g,'') === titleToFound.toLowerCase().replace(/\s/g,'');
                var textExactlyStart = $(movie).text().toLowerCase().replace(/\s/g,'').indexOf(titleToFound.toLowerCase().replace(/\s/g,'')) === 0;
                if (!lock && textExactlyMatch || textExactlyStart) {
                    lock = true;
                    var movieLink = $(movie).find('a').attr('href');
                    // console.log('##############SCRAPE : ',name, ' => ',movieLink);
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

request(url, function(mainError, mainResponse, mainHtml){
    var results = JSON.parse(mainResponse.body);
    var newItems = [];
    var cpt = 0;
    
    if(!mainError && results.items && results.meta.result.totalItems) {
        async.mapSeries(results.items, function(item, done){
            if (item.uri) {
                cpt++;
                request(baseUrl+item.uri, function(error, response, html){
            
                    if(!error){
                        var $ = cheerio.load(html);
                        
                        var imgSrc;
                        var json = { imgSrc : ''};
                        
                        $('img','.nfo-poster-img-container').filter(function(){
                            var imgTemp = ($(this).attr('src') === '/dist/img/no-key-art.jpg') ? false : $(this).attr('src');
                            if (imgTemp) {
                                item.imgUrl = imgTemp;
                                newItems.push(item);
                                done();
                            }
                            else {
                                imdbData.getMovieLink(item.name, item.sortDate, function (imdbMovieLink) {
                                    item.imdbMovieLink = imdbMovieLink;
                                    newItems.push(item);
                                    done();
                                });
                            }
                            console.log(cpt, '/', results.items.length,' ############ :: ', item.imgUrl);
                        });
                    }
                });
            }
        }, function(err, results) {
            fs.writeFile('./output/netflix-upcoming.json', JSON.stringify(newItems), function(err){
                console.log('File successfully written! - Check your project directory for the ./output/netflix-upcoming.json file');
            });
        });
        
        // To write to the system we will use the built in 'fs' library.
        // In this example we will pass 3 parameters to the writeFile function
        // Parameter 1 :  ./output/netflix-upcoming.json - this is what the created filename will be called
        // Parameter 2 :  JSON.stringify(json, null, 4) - the data to write, here we do an extra step by calling JSON.stringify to make our JSON easier to read
        // Parameter 3 :  callback function - a callback function to let us know the status of our function
        
    }
});