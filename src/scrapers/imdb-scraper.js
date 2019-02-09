const request          = require('request');
const cheerio          = require('cheerio');
const async            = require('async');
const colors           = require('colors');
const stringSimilarity = require('string-similarity');
const Filestorage      = require('../media-storage/Filestorage');

const imdbBaseUrl = 'http://www.imdb.com';
const imdbSearchStartUrl = '/find?ref_=nv_sr_fn&q=';
const imdbSearchEndUrl = '&s=all';
function getMediaListUrl (name, year) {
    return imdbBaseUrl + 
        imdbSearchStartUrl + 
        encodeURIComponent(name + '+' +year) + 
        imdbSearchEndUrl;
}
function listScrapping (mediasFounded, titleToFound, name, year, $, lock, enableDownload, uploadcare, callback) {
    console.log('  STEP # MATCHING LIST TITLES ');
    let posterStore = new Filestorage();
    async.eachSeries(mediasFounded, function(media, done){
        const mediaTitle = $(media).text().toLowerCase().replace(/\s/g,'').replace(':','').replace('(tvseries)','').replace('(tvepisode)','').replace('(video)','');
        const title = titleToFound.toLowerCase().replace(/\s/g,'').replace(':','');
        const similarity = stringSimilarity.compareTwoStrings(mediaTitle, title);
        console.log('      Matching test : ',mediaTitle ,' => ', title, ' ', similarity);
        // console.log(mediaTitle.indexOf(title) );
        let textExactlyMatch = mediaTitle === title;
        let textExactlyStart = mediaTitle.indexOf(title) === 0;
        if (!lock && (textExactlyMatch || textExactlyStart || (similarity > 0.79))) {
            lock = true;
            let mediaLink = $(media).find('a').attr('href');
            console.log('        Media link '+ colors.green('FOUNDED') + ' : ',name, ' => ',mediaLink);
            console.log('  STEP # SCRAPE MEDIA: ',name);
            request(imdbBaseUrl + mediaLink, function(mediaError, mediaResponse, mediaHtml){
                if(!mediaError) {
                    console.log('    Media scrappin '+ colors.green('SUCCESS') + ' at ',mediaLink);
                    let $ = cheerio.load(mediaHtml);
                    let posterUrl = $('.poster img').attr('src');
                    let actors = '';
                    $('.credit_summary_item span[itemprop*="actors"] a span').each(function(i){
                        actors += $(this).text();
                        actors += (i < $('.credit_summary_item span[itemprop*="actors"] a span').length - 1) ? ', ' : '...';
                    });
                    let directors = '';
                    $('.credit_summary_item span[itemprop*="director"] a span').each(function(i){
                        directors += $(this).text();
                        directors += (i < $('.credit_summary_item span[itemprop*="director"] a span').length - 1) ? ', ' : '...';
                    });
                    let creators = '';
                    $('.credit_summary_item span[itemprop*="creator"] a span').each(function(i){
                        creators += $(this).text();
                        creators += (i < $('.credit_summary_item span[itemprop*="creator"] a span').length - 1) ? ', ' : '...';
                    });
                    let summary = '';
                    summary += $('.summary_text[itemprop*="description"]').text();
                    console.log('  STEP # DOWNLOAD : ', name, ' ', year);
                    if (enableDownload) {
                        posterStore.download(posterUrl,'./public/posters/' + name.replace('/','') + '+' +year + '.jpg', uploadcare, function (path) {
                            const addedMessage = '    ✓ Poster '+ colors.green('ADDED') + ' at ' + path;
                            const failedMessage = colors.bgYellow.white('MEDIA POSTER ABORDED') + ' => ' + name + year + colors.magenta(' ✘ Poster DOES NOT downloaded') + colors.green(' ✓ but meta data does');
                            console.log( (path) ? addedMessage : failedMessage);
                            callback({'actors': actors, 'localPath': path, 'posterUrl': posterUrl, 'mediaLink': mediaLink, 'directors': directors, 'creators': creators, 'summary' : summary});
                        });
                    }
                    else {
                        console.log(colors.bgYellow.white('DOWNLOAD POSTER DISABLED') + ' => ' + name + year + colors.magenta(' ✘ Poster already downloaded') + colors.green(' ✓ but meta data does'));
                        callback({'actors': actors, 'mediaLink': mediaLink, 'directors': directors, 'creators': creators, 'summary' : summary});
                    }
                }
                else {
                    console.log('    Media scrappin '+ colors.red('FAILED'));
                    // console.log(mediaError);
                    callback({});
                }
            });
            return false;
        }
        else {
            console.log('        Media title '+ colors.red('DONT MATCH'));
            done();
        }
    }, function() {
        console.log(colors.bgRed.white('MEDIA SEARCH ABORDED'),' => ',name,year,colors.magenta(' ✘ MEDIA NOT FOUND IN LIST'));
        callback({});
    });
}
function getMedia(name, year, enableDownload, uploadcare, callback) {
    console.log(colors.inverse('IMDB media to found'),colors.bgGreen.white(name,year));

    let url = getMediaListUrl(name, year);
    let lock = false;
    console.log('  STEP # SCRAPE LIST: ',name, ' ',year);
    request(url, function(mediasError, mediasResponse, mediasHtml){
        if(!mediasError) {
            console.log('    1st List scrappin with exact year '+ colors.green('SUCCESS'));
            let titleToFound = name + ' (' + year + ')';
            let $ = cheerio.load(mediasHtml);
            let mediasFounded = $('.findList tbody tr.findResult td.result_text');
            if (!mediasFounded || mediasFounded.length < 1) {
                console.log('      List scrappin '+ colors.red('WITHOUT MEDIA'));
                url = getMediaListUrl(name, --year);
                request(url, function(mediasError, mediasResponse, mediasHtml){
                    console.log('    2nd List scrappin with decreased year '+ colors.green('SUCCESS'));
                    titleToFound = name + ' (' + year + ')';
                    $ = cheerio.load(mediasHtml);
                    mediasFounded = $('.findList tbody tr.findResult td.result_text');
                    if (!mediasFounded || mediasFounded.length < 1) {
                        console.log('      List scrappin '+ colors.red('WITHOUT MEDIA'));
                        url = getMediaListUrl(name, --year);
                        request(url, function(mediasError, mediasResponse, mediasHtml){
                            console.log('    3rd List scrappin with decreased year '+ colors.green('SUCCESS'));
                            titleToFound = name + ' (' + year + ')';
                            $ = cheerio.load(mediasHtml);
                            mediasFounded = $('.findList tbody tr.findResult td.result_text');
                            if (!mediasFounded || mediasFounded.length < 1) {
                                console.log('      List scrappin '+ colors.red('WITHOUT MEDIA'));
                                let now = new Date();
                                year = now.getFullYear();
                                url = getMediaListUrl(name, year);
                                request(url, function(mediasError, mediasResponse, mediasHtml){
                                    console.log('    4rd List scrappin with current year '+ colors.green('SUCCESS'));
                                    titleToFound = name + ' (' + year + ')';
                                    $ = cheerio.load(mediasHtml);
                                    mediasFounded = $('.findList tbody tr.findResult td.result_text');
                                    if (!mediasFounded || mediasFounded.length < 1) {
                                        console.log(colors.bgRed.white('MEDIA SEARCH ABORDED'),' => ',name,year,colors.magenta(' ✘ NO LIST FOUNDED'));
                                        callback({});
                                    }
                                    else {
                                        listScrapping(mediasFounded, titleToFound, name, year, $, lock, enableDownload, uploadcare, callback);
                                    }
                                });
                            }
                            else {
                                listScrapping(mediasFounded, titleToFound, name, year, $, lock, enableDownload, uploadcare, callback);
                            }
                        });

                    }
                    else {
                        listScrapping(mediasFounded, titleToFound, name, year, $, lock, enableDownload, uploadcare, callback);
                    }
                });
            }
            else {
                listScrapping(mediasFounded, titleToFound, name, year, $, lock, enableDownload, uploadcare, callback);
            }
        }
        else {
            console.log('    List scrappin '+ colors.red('FAILED '));
            // console.log(mediasError);
            callback({});
        }
    });
}

exports.getMedia = getMedia;